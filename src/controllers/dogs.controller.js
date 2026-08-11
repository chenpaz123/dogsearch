const { GetHisunValid } = require("../utils/chip-validator.util");
const { getdatafrommoagdb } = require("../utils/moag-api.util");
const { db } = require("../firebase/firebase");
const { withCache, invalidateCache } = require("../utils/cache.util");
const { showDogCacheKey } = require("../utils/cache-keys.util");
const { createLogger } = require("../utils/logger.util");
const { ValidationError, NotFoundError, ServiceUnavailableError, ConflictError, UnprocessableEntityError } = require("../utils/errors.util");
const { successResponse, createResponse } = require("../utils/response.util");
const HTTP_STATUS = require("../constants/http-status");
const ERROR_MESSAGES = require("../constants/error-messages");

/**
 * @typedef {Object} AddDogRequest
 * @property {{ [key: string]: any }[]} [data.AnimalDetails]
 * @property {string} [Show]
 * @property {string|number} [ChipNum]
 */

/**
 * @typedef {Object} AddDogResponse
 * @property {number} status
 * @property {string} message
 * @property {{ [key: string]: any }} [dog]
 * @property {boolean} [KalevetValid]
 * @property {boolean} [BrucellaValid]
 * @property {string} [brucelladate]
 */

const logger = createLogger("controller:dogs");
const DOG_DOC_CACHE_TTL_MS = Number(process.env.DOG_CACHE_TTL_MS || 15000);

/**
 * Adds a dog to a specific show when vaccination data is valid.
 * @param {AddDogRequest} params
 * @returns {Promise<AddDogResponse>}
 */
const addDogToShow = async ({ data, Show, ChipNum }) => {
  if (!Show) {
    throw new ValidationError(ERROR_MESSAGES.SHOW_NAME_REQUIRED);
  }

  const docname = `${Show}`;

  // Removed generic try-catch to allow global error handler to catch unexpected errors.
  // Specific errors can still be handled here if needed.

  let dogRecord = data?.["AnimalDetails"]?.[0];
  let resolvedChip = dogRecord?.["ChipNumber"] || ChipNum;

  if (!dogRecord && resolvedChip) {
    try {
      const lookup = await getdatafrommoagdb(resolvedChip);
      dogRecord = lookup?.AnimalDetails?.[0];
      resolvedChip = dogRecord?.["ChipNumber"];
    } catch (error) {
       logger.error("failed to fetch from moag db", { error: error.message });
       // Any failure to reach or parse the external MOAG registry (network
       // error, non-2xx status, or a non-JSON body such as a WAF challenge
       // page) means the registry is effectively unavailable to us.
       throw new ServiceUnavailableError(ERROR_MESSAGES.EXTERNAL_SERVICE_UNAVAILABLE);
    }
  }

  if (!dogRecord || !resolvedChip) {
    throw new NotFoundError(ERROR_MESSAGES.DOG_NOT_FOUND);
  }

  const hisunDate = dogRecord["HisunDate"];
  const isValid = GetHisunValid(hisunDate);

  const docRef = db
    .collection("shows")
    .doc(docname)
    .collection("dogs")
    .doc(String(resolvedChip));

  const cacheKey = showDogCacheKey(docname, resolvedChip);
  const docSnapshot = await withCache(
    cacheKey,
    async () => {
      const snapshot = await docRef.get();
      return {
        exists: snapshot.exists,
        data: snapshot.exists ? snapshot.data() : undefined,
      };
    },
    { ttlMs: DOG_DOC_CACHE_TTL_MS }
  );

  if (!docSnapshot.exists) {
    return createResponse(
      HTTP_STATUS.CONFLICT,
      ERROR_MESSAGES.MISSING_BRUCELLA,
      {
        dog: dogRecord,
        KalevetValid: isValid,
        BrucellaValid: false,
      }
    );
  }

  if (!isValid) {
    const cachedData = docSnapshot.data || {};
    return createResponse(
      HTTP_STATUS.UNPROCESSABLE_ENTITY,
      ERROR_MESSAGES.INVALID_VACCINATION,
      {
        dog: dogRecord,
        KalevetValid: false,
        BrucellaValid: Boolean(cachedData.brucella),
      }
    );
  }

  await docRef.update(dogRecord);
  invalidateCache(cacheKey);

  const cachedData = docSnapshot.data || {};
  const brucellaDate = cachedData.brucella;
  return successResponse(ERROR_MESSAGES.DOG_ADDED, {
    dog: dogRecord,
    KalevetValid: true,
    brucelladate: brucellaDate,
    BrucellaValid: Boolean(brucellaDate),
  });
};

module.exports = { addDogToShow };
