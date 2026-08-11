const moment = require("moment");
const { db } = require("../firebase/firebase");
const { createLogger } = require("../utils/logger.util");
const { invalidateCache } = require("../utils/cache.util");
const { SHOWS_CACHE_KEY } = require("../utils/cache-keys.util");
const { ValidationError } = require("../utils/errors.util");
const { createdResponse, successResponse } = require("../utils/response.util");

const logger = createLogger("controller:shows");

const addshow = async ({ KenelClubName }) => {
  const trimmedName = (KenelClubName || "").trim();
  if (!trimmedName) {
    throw new ValidationError("show name is required");
  }

  const showDate = moment.utc().format("DD.MM.YYYY");
  const docname = `${trimmedName} - ${showDate}`;

  const docRef = db.collection("shows").doc(docname);
  await docRef.set({
    KenelClubName: trimmedName,
    ShowDate: showDate,
  });
  
  invalidateCache(SHOWS_CACHE_KEY);
  
  return createdResponse("show added successfully");
};

/**
 * Retrieves a list of all available dog shows.
 * 
 * @returns {Promise<Object>} An object containing the list of shows.
 */
const getshows = async () => {
  const snapshot = await db.collection("shows").get();
  const shows = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      name: data.KenelClubName,
      date: data.ShowDate,
    };
  });
  
  return successResponse("shows retrieved", { shows });
};

module.exports = { addshow, getshows };
