const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");
require("dotenv").config();

/**
 * Loads Firebase service account credentials.
 *
 * Priority order (first found is used):
 * 1. FIREBASE_SERVICE_ACCOUNT - Inline JSON string (recommended for cloud deployments)
 * 2. FIREBASE_SERVICE_ACCOUNT_PATH - Path to JSON file (recommended for local development)
 * 3. GOOGLE_APPLICATION_CREDENTIALS - Environment default (fallback for GCP deployments)
 *
 * @returns {Object|null} Service account credentials object or null
 */
const loadServiceAccount = () => {
  // Priority 1: Inline JSON string
  // Use this for cloud deployments (Heroku, Firebase Functions, etc.) where you can set env vars
  const inline = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (inline) {
    try {
      return JSON.parse(inline);
    } catch (error) {
      throw new Error("FIREBASE_SERVICE_ACCOUNT contains invalid JSON");
    }
  }

  // Priority 2: File path to service account JSON
  // Use this for local development - add path to .env file
  const filePath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (filePath) {
    const resolvedPath = path.isAbsolute(filePath)
      ? filePath
      : path.join(process.cwd(), filePath);
    try {
      const fileContents = fs.readFileSync(resolvedPath, "utf8");
      return JSON.parse(fileContents);
    } catch (error) {
      throw new Error(
        `Unable to read Firebase service account from ${resolvedPath}: ${error.message}`
      );
    }
  }

  // Priority 3: No explicit credentials provided
  // Falls back to GOOGLE_APPLICATION_CREDENTIALS environment variable
  return null;
};

const serviceAccount = loadServiceAccount();
const firebaseConfig = {};

if (serviceAccount) {
  firebaseConfig.credential = admin.credential.cert(serviceAccount);
} else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  firebaseConfig.credential = admin.credential.applicationDefault();
}

if (process.env.FIREBASE_DATABASE_URL) {
  firebaseConfig.databaseURL = process.env.FIREBASE_DATABASE_URL;
}

admin.initializeApp(firebaseConfig);

const db = admin.firestore();

module.exports = { admin, db };
