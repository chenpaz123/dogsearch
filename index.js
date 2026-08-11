const functions = require("firebase-functions");

const applyRuntimeConfig = () => {
  const config = functions.config() || {};
  const appConfig = config.app || {};

  const mappings = {
    FIREBASE_SERVICE_ACCOUNT: "firebase_service_account",
    FIREBASE_SERVICE_ACCOUNT_PATH: "firebase_service_account_path",
    FIREBASE_DATABASE_URL: "firebase_database_url",
    ALLOWED_MANAGER_EMAILS: "allowed_manager_emails",
    ALLOWED_ORIGINS: "allowed_origins",
    FIREBASE_API_KEY: "firebase_api_key",
    FIREBASE_AUTH_DOMAIN: "firebase_auth_domain",
    FIREBASE_PROJECT_ID: "firebase_project_id",
    FIREBASE_STORAGE_BUCKET: "firebase_storage_bucket",
    FIREBASE_MESSAGING_SENDER_ID: "firebase_messaging_sender_id",
    FIREBASE_APP_ID: "firebase_app_id",
    FIREBASE_MEASUREMENT_ID: "firebase_measurement_id",
  };

  Object.entries(mappings).forEach(([envKey, configKey]) => {
    if (!process.env[envKey] && appConfig[configKey]) {
      process.env[envKey] = appConfig[configKey];
    }
  });
};

applyRuntimeConfig();

const app = require("./src/server");

exports.app = functions.https.onRequest(app);
