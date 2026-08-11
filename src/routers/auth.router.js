const express = require("express");
const { admin } = require("../firebase/firebase");
const { logger } = require("../utils/logger.util");

const router = express.Router();

/**
 * Generates a Firebase Custom Token for the 'kiosk-user'.
 * This token allows the frontend to sign in as 'kiosk-user' without knowing a password.
 */
router.get("/auth/token", async (req, res) => {
  const uid = "kiosk-user";
  const additionalClaims = {
    role: "kiosk"
  };

  try {
    const customToken = await admin.auth().createCustomToken(uid, additionalClaims);
    logger.info(`Generated custom token for UID: ${uid}`);
    res.json({ token: customToken });
  } catch (error) {
    logger.error("Error creating custom token:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
