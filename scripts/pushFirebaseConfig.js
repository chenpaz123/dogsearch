#!/usr/bin/env node
/*
 * Reads Firebase-related configuration from the local .env file and service-account JSON,
 * then prints a ready-to-run `firebase functions:config:set` command so you can push the
 * values into Firebase runtime config without committing secrets to the repository.
 */

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const dotenv = require("dotenv");

const projectRoot = path.resolve(__dirname, "..");
const envPath = path.join(projectRoot, ".env");

dotenv.config({ path: envPath });

const env = process.env;

const configKeys = {
  firebase_database_url: env.FIREBASE_DATABASE_URL,
  firebase_api_key: env.FIREBASE_API_KEY,
  firebase_auth_domain: env.FIREBASE_AUTH_DOMAIN,
  firebase_project_id: env.FIREBASE_PROJECT_ID,
  firebase_storage_bucket: env.FIREBASE_STORAGE_BUCKET,
  firebase_messaging_sender_id: env.FIREBASE_MESSAGING_SENDER_ID,
  firebase_app_id: env.FIREBASE_APP_ID,
  firebase_measurement_id: env.FIREBASE_MEASUREMENT_ID,
  allowed_manager_emails: env.ALLOWED_MANAGER_EMAILS,
  allowed_origins: env.ALLOWED_ORIGINS,
};

const locateServiceAccount = () => {
  const explicitPath = env.FIREBASE_SERVICE_ACCOUNT_PATH;
  const fallback = path.join(projectRoot, "src", "firebase", "key.json");
  const candidate = explicitPath ? path.resolve(projectRoot, explicitPath) : fallback;
  if (!fs.existsSync(candidate)) {
    return null;
  }
  return candidate;
};

const serviceAccountPath = locateServiceAccount();
let serviceAccountJSON = null;
if (serviceAccountPath) {
  try {
    const raw = fs.readFileSync(serviceAccountPath, "utf8");
    JSON.parse(raw); // validate JSON
    serviceAccountJSON = raw;
  } catch (error) {
    console.warn(`??  Failed to read service account from ${serviceAccountPath}: ${error.message}`);
  }
}

if (serviceAccountJSON) {
  configKeys.firebase_service_account = serviceAccountJSON;
}

const missing = Object.entries(configKeys)
  .filter(([_, value]) => value == null || value === "")
  .map(([key]) => key);

if (missing.length) {
  console.warn("??  Missing values for:", missing.join(", "));
  console.warn("   These keys will be skipped. Populate .env or Firebase config before deploying.");
}

const escapeForShell = (value) =>
  value
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\$/g, '\\$')
    .replace(/`/g, "\\`");

const commandParts = Object.entries(configKeys)
  .filter(([_, value]) => value != null && value !== "")
  .map(([key, value]) => `app.${key}="${escapeForShell(value)}"`);

if (!commandParts.length) {
  console.error("No configuration values found. Aborting.");
  process.exit(1);
}

console.log("Firebase runtime config preview (app namespace):\n");
const preview = Object.fromEntries(
  Object.entries(configKeys).filter(([_, value]) => value != null && value !== "")
);
console.log(JSON.stringify(preview, null, 2));

console.log("\nRun the following command to push the values to Firebase:\n");
console.log(`firebase functions:config:set ${commandParts.join(" ")}`);

console.log("\nTo generate a local .runtimeconfig.json for emulators, run:\n");
console.log("firebase functions:config:get > .runtimeconfig.json");

// Optional helper: invoke firebase-tools directly when desired.
if (process.argv.includes("--apply")) {
  console.log("\nApplying config via firebase-tools...\n");
  const result = spawnSync("npx", ["firebase", "functions:config:set", ...commandParts], {
    stdio: "inherit",
    cwd: projectRoot,
  });
  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}
