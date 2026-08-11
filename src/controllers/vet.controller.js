const { lookupVetByLicense } = require("../utils/vet-registry.util");
const {
  ValidationError,
  NotFoundError,
  ServiceUnavailableError,
} = require("../utils/errors.util");
const { successResponse } = require("../utils/response.util");
const { createLogger } = require("../utils/logger.util");
const ERROR_MESSAGES = require("../constants/error-messages");

const logger = createLogger("controller:vet");

/**
 * Verifies a vet's license number against the government registry and
 * returns their name if it matches. The frontend used to do this lookup
 * itself and simply trust whatever data.gov.il returned; doing it here
 * means the client can no longer forge a login by fabricating the response.
 *
 * @param {string} licenseNumber
 */
const vetLogin = async (licenseNumber) => {
  if (!licenseNumber || typeof licenseNumber !== "string" || !licenseNumber.trim()) {
    throw new ValidationError(ERROR_MESSAGES.LICENSE_NUMBER_REQUIRED);
  }

  const trimmedLicense = licenseNumber.trim();

  let vet;
  try {
    vet = await lookupVetByLicense(trimmedLicense);
  } catch (error) {
    logger.error("failed to query vet registry", { error: error.message });
    throw new ServiceUnavailableError(ERROR_MESSAGES.EXTERNAL_SERVICE_UNAVAILABLE);
  }

  if (!vet) {
    throw new NotFoundError(ERROR_MESSAGES.VET_NOT_FOUND);
  }

  logger.info("vet login succeeded", { licenseNumber: trimmedLicense });

  return successResponse(ERROR_MESSAGES.VET_LOGIN_SUCCESS, {
    vetFirstName: vet.firstName,
    vetLastName: vet.lastName,
  });
};

module.exports = { vetLogin };
