const { db } = require("../firebase/firebase");
const { invalidateCache } = require("../utils/cache.util");
const { showDogCacheKey } = require("../utils/cache-keys.util");
const { createLogger } = require("../utils/logger.util");
const { ValidationError, ConflictError } = require("../utils/errors.util");
const { createdResponse } = require("../utils/response.util");
const ERROR_MESSAGES = require("../constants/error-messages");

const logger = createLogger("controller:brucella");

const brucellaFirestore = async (show, chipnum, date) => {
  const showName = (show || "").trim();
  const chip = (chipnum || "").toString().trim();
  const brucellaDate = (date || "").trim();

  if (!showName || !chip || !brucellaDate) {
    throw new ValidationError("show, chip number and date are required");
  }

  const docname = `${showName}`;
  const docRef = db
    .collection("shows")
    .doc(docname)
    .collection("dogs")
    .doc(chip);

  const docSnapshot = await docRef.get();
  if (docSnapshot.exists) {
    throw new ConflictError(
      "Brucella test data already exists for this dog in this show"
    );
  }

  await docRef.set(
    {
      brucella: brucellaDate,
    },
    { merge: true }
  );
  invalidateCache(showDogCacheKey(docname, chip));

  return createdResponse("brucella added successfully", {
    chip,
    date: brucellaDate,
  });
};

module.exports = { brucellaFirestore };
