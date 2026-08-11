const { admin } = require("../firebase/firebase");
const { createLogger } = require("../utils/logger.util");

const logger = createLogger("middleware:requireFirebaseAuth");

const parseAllowedEmails = () => {
  const raw = process.env.ALLOWED_MANAGER_EMAILS;
  if (!raw) {
    return [];
  }
  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
};

const allowedEmails = parseAllowedEmails();

const requireFirebaseAuth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    if (!header.startsWith("Bearer ")) {
      return res.status(401).json({ status: 401, message: "missing bearer token" });
    }

    const token = header.slice("Bearer ".length).trim();
    if (!token) {
      return res.status(401).json({ status: 401, message: "missing bearer token" });
    }

    const decoded = await admin.auth().verifyIdToken(token);
    if (allowedEmails.length > 0) {
      const email = (decoded.email || "").toLowerCase();
      if (!allowedEmails.includes(email)) {
        return res.status(403).json({ status: 403, message: "unauthorised user" });
      }
    }

    req.user = decoded;
    return next();
  } catch (error) {
    logger.error("firebase auth failed", { error });
    return res.status(401).json({ status: 401, message: "invalid authentication token" });
  }
};

module.exports = requireFirebaseAuth;
