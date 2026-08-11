const { db } = require("../firebase/firebase");
const { fixdatetodot } = require("../utils/date-formatter.util");
const { withCache, invalidateCache } = require("../utils/cache.util");
const { createLogger } = require("../utils/logger.util");
const { SHOWS_CACHE_KEY } = require("../utils/cache-keys.util");
const {
  ValidationError,
  NotFoundError,
  ConflictError,
} = require("../utils/errors.util");
const { successResponse, createResponse } = require("../utils/response.util");
const { sanitizeText } = require("../utils/input-sanitizer.util");
const HTTP_STATUS = require("../constants/http-status");
const ERROR_MESSAGES = require("../constants/error-messages");
const config = require("../config");

const logger = createLogger("controller:manager");
const SHOWS_CACHE_TTL_MS = config.cache.showsTtl;

/**
 * Creates a new show in the database.
 *
 * @param {string} showName - The name of the show.
 * @param {string} date - The date of the show.
 * @param {string} desc - The description of the show.
 * @returns {Promise<Object>} The result of the operation.
 */
const createShow = async (showName, date, desc) => {
  if (!showName || !date) {
    throw new ValidationError(ERROR_MESSAGES.SHOW_NAME_DATE_REQUIRED);
  }

  // Sanitize inputs to prevent XSS
  const sanitizedName = sanitizeText(showName);
  const sanitizedDesc = sanitizeText(desc || "");

  const formattedDate = fixdatetodot(date);
  const docId = `${sanitizedName} - ${formattedDate}`;
  const showRef = db.collection("shows").doc(docId);

  if ((await showRef.get()).exists) {
    throw new ConflictError(ERROR_MESSAGES.SHOW_ALREADY_EXISTS);
  }

  logger.info("saving show to firestore", {
    docId,
    desc: sanitizedDesc,
    KenelClubName: sanitizedName,
    ShowDate: formattedDate,
  });
  await showRef.set({
    desc: sanitizedDesc,
    KenelClubName: sanitizedName,
    ShowDate: formattedDate,
  });

  invalidateCache(SHOWS_CACHE_KEY);
  logger.info("created show", { show: showName, date: formattedDate });

  return successResponse(ERROR_MESSAGES.SHOW_CREATED);
};

/**
 * Retrieves all the shows from the database with pagination support.
 *
 * @param {number} limit - Maximum number of shows to return (default: 50)
 * @param {number} offset - Number of shows to skip (default: 0)
 * @returns {Object} An object containing a status code, a message, and an array of show objects.
 */
const getallshows = async (limit = 50, offset = 0) => {
  // Don't cache paginated results - causes stale data issues
  // Each page should be fresh from DB

  try {
    // Use Firestore native pagination with ordering
    let query = db.collection("shows").orderBy("__name__"); // Order by document ID for consistent pagination

    // Skip documents if offset > 0
    if (offset > 0) {
      const skipSnapshot = await db
        .collection("shows")
        .orderBy("__name__")
        .limit(offset)
        .get();

      if (!skipSnapshot.empty) {
        const lastVisible = skipSnapshot.docs[skipSnapshot.docs.length - 1];
        query = query.startAfter(lastVisible);
      }
    }

    // Get only the documents we need + 1 to check if there are more
    const showsSnapshot = await query.limit(limit + 1).get();

    // Get total count separately (only for display, not for pagination logic)
    const totalSnapshot = await db.collection("shows").get();
    const totalShows = totalSnapshot.size;

    if (totalShows === 0) {
      return createResponse(HTTP_STATUS.OK, ERROR_MESSAGES.NO_SHOWS_AVAILABLE, {
        shows: [],
        total: 0,
        limit,
        offset,
        hasMore: false,
      });
    }

    // Check if there are more results
    const hasMore = showsSnapshot.docs.length > limit;
    const docsToShow = hasMore
      ? showsSnapshot.docs.slice(0, limit)
      : showsSnapshot.docs;

    // Map shows with dog counts
    const mappedShows = await Promise.all(
      docsToShow.map(async (show) => {
        const showName = show.id.split(" - ");
        const dogsSnapshot = await show.ref.collection("dogs").get();
        return {
          name: showName[0],
          date: showName[1],
          desc: show.data().desc || "",
          dogCount: dogsSnapshot.size,
        };
      })
    );

    return successResponse(ERROR_MESSAGES.SHOWS_RETURNED, {
      shows: mappedShows,
      total: totalShows,
      limit,
      offset,
      hasMore,
    });
  } catch (error) {
    logger.error("failed to get shows", { error, limit, offset });
    throw error;
  }
};

/**
 * Deletes a show from the database.
 *
 * @param {Object} show - The show object to be deleted.
 * @returns {Object} An object containing a status code and a message.
 */
const deleteShow = async (show) => {
  logger.debug("delete show requested", { show });
  const showName = `${show.name} - ${show.date}`;
  const showdoc = db.collection("shows").doc(`${showName}`);

  if (!(await showdoc.get()).exists) {
    throw new NotFoundError(ERROR_MESSAGES.SHOW_NOT_FOUND);
  }

  const dogsSnapshot = await showdoc.collection("dogs").get();
  if (!dogsSnapshot.empty) {
    const batch = db.batch();
    dogsSnapshot.forEach((dogDoc) => {
      batch.delete(dogDoc.ref);
    });
    await batch.commit();
  }

  await showdoc.delete();
  invalidateCache(SHOWS_CACHE_KEY);
  logger.info("show deleted", { show: showName });

  return successResponse(ERROR_MESSAGES.SHOW_DELETED);
};

/**
 * Updates an existing show in the database with new information.
 *
 * @param {Object} oldshow - The old show object to be updated.
 * @param {Object} updatedshow - The new show object containing updated information.
 * @returns {Object} An object containing a status code and a message.
 */
const updateshow = async (oldshow, updatedshow) => {
  logger.debug("update show requested", { oldshow, updatedshow });

  if (!oldshow || !updatedshow) {
    throw new ValidationError(ERROR_MESSAGES.INVALID_PAYLOAD);
  }

  // Sanitize inputs
  const sanitizedName = sanitizeText(updatedshow.name);
  const sanitizedDesc = sanitizeText(updatedshow.desc || "");

  const oldDocId = `${oldshow.name} - ${oldshow.date}`;
  const formattedDate = fixdatetodot(updatedshow.date);
  const newDocId = `${sanitizedName} - ${formattedDate}`;

  const oldShowRef = db.collection("shows").doc(oldDocId);
  const newShowRef = db.collection("shows").doc(newDocId);

  // Check if old show exists first
  const oldSnapshot = await oldShowRef.get();
  if (!oldSnapshot.exists) {
    throw new NotFoundError(ERROR_MESSAGES.SHOW_NOT_FOUND);
  }

  if (oldDocId === newDocId) {
    // Simple update - no rename
    await oldShowRef.set({ desc: sanitizedDesc }, { merge: true });
    logger.info("show updated", { show: newDocId, mode: "merge" });
    invalidateCache(SHOWS_CACHE_KEY);
    return successResponse(ERROR_MESSAGES.SHOW_UPDATED);
  }

  // Rename operation - use batch to handle atomically
  // First, get all dogs that need to be transferred
  const dogsSnapshot = await oldShowRef.collection("dogs").get();

  // Use a batch for the entire operation
  const batch = db.batch();

  // Create new show document
  batch.set(newShowRef, {
    desc: sanitizedDesc,
    KenelClubName: sanitizedName,
    ShowDate: formattedDate,
  });

  // Transfer all dogs in the same batch
  dogsSnapshot.forEach((dogDoc) => {
    const targetDoc = newShowRef.collection("dogs").doc(dogDoc.id);
    batch.set(targetDoc, dogDoc.data());
    batch.delete(dogDoc.ref);
  });

  // Delete old show document
  batch.delete(oldShowRef);

  // Commit everything atomically
  try {
    await batch.commit();
    logger.info("show renamed successfully", {
      from: oldDocId,
      to: newDocId,
      dogsTransferred: dogsSnapshot.size,
    });
  } catch (error) {
    logger.error("failed to rename show", {
      error,
      from: oldDocId,
      to: newDocId,
    });
    throw error;
  }

  invalidateCache(SHOWS_CACHE_KEY);
  return successResponse(ERROR_MESSAGES.SHOW_UPDATED);
};

module.exports = {
  createShow,
  getallshows,
  deleteShow,
  updateshow,
};
