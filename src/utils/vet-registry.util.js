const fetch = require("node-fetch");
const { createLogger } = require("./logger.util");

const logger = createLogger("utils:vetRegistry");

const VET_REGISTRY_URL = "https://data.gov.il/api/3/action/datastore_search";
const VET_RESOURCE_ID = "14339de6-278c-49ed-a6c1-307044aaee3f";
const KEY_FIRST_NAME = "שם_פרטי";
const KEY_LAST_NAME = "שם_משפחה";
const KEY_LICENSE_NUMBER = "מספר_רשיון";

/**
 * Looks up a veterinarian by license number against the government registry.
 * Runs server-side so the client never talks to data.gov.il (or trusts
 * whatever it returns) directly.
 *
 * @param {string} licenseNumber
 * @returns {Promise<{firstName: string, lastName: string, licenseNumber: string}|null>}
 */
const lookupVetByLicense = async (licenseNumber) => {
  const url = `${VET_REGISTRY_URL}?resource_id=${VET_RESOURCE_ID}&limit=5&q=${encodeURIComponent(
    licenseNumber
  )}`;

  let response;
  try {
    response = await fetch(url);
  } catch (error) {
    logger.error("vet registry request failed", { error: error.message });
    throw new Error(`vet registry request failed: ${error.message}`);
  }

  if (!response.ok) {
    logger.error("vet registry returned non-OK status", { status: response.status });
    throw new Error(`vet registry returned status ${response.status}`);
  }

  const payload = await response.json();
  const records = payload?.result?.records || [];
  const record = records.find(
    (r) => String(r[KEY_LICENSE_NUMBER] || "").trim() === licenseNumber
  );

  if (!record) {
    return null;
  }

  return {
    firstName: record[KEY_FIRST_NAME] || "",
    lastName: record[KEY_LAST_NAME] || "",
    licenseNumber: String(record[KEY_LICENSE_NUMBER] || "").trim(),
  };
};

module.exports = { lookupVetByLicense };
