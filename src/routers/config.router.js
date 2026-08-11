const express = require("express");

const router = express.Router();

const firebaseEnvMap = [
  ["apiKey", ["FIREBASE_API_KEY", "apiKey"]],
  ["authDomain", ["FIREBASE_AUTH_DOMAIN", "authDomain"]],
  ["databaseURL", ["FIREBASE_DATABASE_URL", "databaseURL"]],
  ["projectId", ["FIREBASE_PROJECT_ID", "projectId"]],
  ["storageBucket", ["FIREBASE_STORAGE_BUCKET", "storageBucket"]],
  ["messagingSenderId", ["FIREBASE_MESSAGING_SENDER_ID", "messagingSenderId"]],
  ["appId", ["FIREBASE_APP_ID", "appId"]],
  ["measurementId", ["FIREBASE_MEASUREMENT_ID", "measurementId"]],
];

const requiredFirebaseKeys = ["apiKey", "authDomain", "databaseURL", "projectId"];

const sanitiseValue = (value) => {
  if (typeof value !== "string") {
    return undefined;
  }

  let trimmed = value.trim();

  if (trimmed.endsWith(",")) {
    trimmed = trimmed.slice(0, -1);
  }

  if (
    (trimmed.startsWith("\"") && trimmed.endsWith("\"")) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    trimmed = trimmed.slice(1, -1);
  }

  return trimmed.length > 0 ? trimmed : undefined;
};

const buildFirebaseConfig = () => {
  const config = {};

  firebaseEnvMap.forEach(([clientKey, envKeys]) => {
    const keys = Array.isArray(envKeys) ? envKeys : [envKeys];
    const value = keys
      .map((key) => sanitiseValue(process.env[key]))
      .find((v) => typeof v === "string" && v.length > 0);

    if (value) {
      config[clientKey] = value;
    }
  });

  return config;
};

router.get("/config/firebase", (req, res) => {
  const config = buildFirebaseConfig();
  const missing = requiredFirebaseKeys.filter((key) => !config[key]);

  if (missing.length > 0) {
    const message = `Missing Firebase configuration values: ${missing.join(", ")}`;
    // Log the error so we can see it in the server console
    console.error(message); 
    return res.status(500).json({
      status: 500,
      message,
    });
  }

  return res.json({
    status: 200,
    config,
  });
});

module.exports = router;