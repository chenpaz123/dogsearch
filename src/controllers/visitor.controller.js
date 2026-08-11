const { ocr } = require("../controllers/ocr.controller");
const { markStart, markEnd, logPerf } = require("../utils/performance.util");
const { GetBrucellaValid } = require("../utils/chip-validator.util");
const { fixdate } = require("../utils/date-formatter.util");
const { createLogger } = require("../utils/logger.util");
const brucellaController = require("./brucella.controller");

/**
 * @typedef {Object} VisitorRequest
 * @property {string} [showdate]
 * @property {string} [image]
 * @property {string} [chipnum]
 * @property {string} [show]
 */

/**
 * @typedef {Object} VisitorResponse
 * @property {number} status
 * @property {string} message
 * @property {string} [chip]
 * @property {string} [date]
 * @property {boolean} [result]
 */

const logger = createLogger("controller:visitor");

/**
 * Validates visitor data extracted from an uploaded brucella document.
 *
 * @param {Object} params - The visitor data parameters.
 * @param {string} params.showdate - The date of the show.
 * @param {string} params.image - The base64 encoded image.
 * @param {string} params.chipnum - The dog's chip number.
 * @param {string} params.show - The selected show ID.
 * @param {string} params.brucelladate - The manually entered Brucella test date.
 * @returns {Promise<Object>} The validation result containing status and message.
 */
const getvisitordata = async ({
  showdate,
  image,
  chipnum,
  show,
  brucelladate,
}) => {
  markStart("visitor:getvisitordata");
  logger.debug("getvisitordata called", {
    showdate,
    chipnum,
    show,
    brucelladate,
  });
  try {
    if (!image) {
      const response = {
        status: 400,
        message: "image is required",
      };
      logPerf(markEnd("visitor:getvisitordata"));
      return response;
    }

    markStart("visitor:ocr");
    const ocrResponse = await ocr(image);
    logPerf(markEnd("visitor:ocr"));

    if (!ocrResponse || typeof ocrResponse.status !== "number") {
      const response = {
        status: 400,
        message: "brucella not added",
      };
      logPerf(markEnd("visitor:getvisitordata"));
      return response;
    }

    if (ocrResponse.status !== 200) {
      logPerf(markEnd("visitor:getvisitordata"));
      return ocrResponse;
    }

    const { date, chip, result } = ocrResponse;

    if (!chip) {
      const response = {
        status: 400,
        message: "chip number missing",
        date,
      };
      logPerf(markEnd("visitor:getvisitordata"));
      return response;
    }

    if (chipnum && chip !== chipnum) {
      const response = {
        status: 406,
        message: "chip number mismatch",
        chip,
        date,
      };
      logPerf(markEnd("visitor:getvisitordata"));
      return response;
    }

    if (result === "unknown") {
      const response = {
        status: 422,
        message: "could not determine brucella result",
        chip,
        date,
        result: false,
      };
      logPerf(markEnd("visitor:getvisitordata"));
      return response;
    }

    if (!result) {
      const response = {
        status: 422,
        message: "brucella result not negative",
        chip,
        date,
        result,
      };
      logPerf(markEnd("visitor:getvisitordata"));
      return response;
    }

    const ocrDate = date ? fixdate(date) : undefined;
    const manualDate = brucelladate ? fixdate(brucelladate) : undefined;

    if (!ocrDate) {
      const response = {
        status: 403,
        message:
          "Could not read date from image. Please ensure the date is clear.",
        chip,
      };
      logPerf(markEnd("visitor:getvisitordata"));
      return response;
    }

    if (!manualDate) {
      const response = {
        status: 400,
        message: "Manual date is required for verification.",
        chip,
      };
      logPerf(markEnd("visitor:getvisitordata"));
      return response;
    }

    if (ocrDate !== manualDate) {
      const response = {
        status: 406,
        message: `Date mismatch: OCR read '${ocrDate}' but you entered '${manualDate}'.`,
        chip,
        date: ocrDate,
      };
      logPerf(markEnd("visitor:getvisitordata"));
      return response;
    }

    const formattedDate = ocrDate;

    const brucellaValid = GetBrucellaValid(formattedDate, showdate);
    if (!brucellaValid) {
      const response = {
        status: 402,
        message: "brucella not valid",
        chip,
        date: formattedDate,
      };
      logPerf(markEnd("visitor:getvisitordata"));
      return response;
    }

    // Automatically save to Firestore if valid
    if (show) {
      const saveResult = await brucellaController.brucellaFirestore(
        show,
        chip,
        formattedDate
      );
      if (saveResult.status !== 201) {
        logPerf(markEnd("visitor:getvisitordata"));
        return saveResult;
      }
    }

    const success = {
      message: "brucella is valid and saved",
      status: 201,
      chip,
      date: formattedDate,
      result,
    };
    logPerf(markEnd("visitor:getvisitordata"));
    return success;
  } catch (error) {
    logger.error("failed to get visitor data", { error });
    const response = {
      message: error.message || "brucella not added",
      status: error.statusCode || 400,
    };
    logPerf(markEnd("visitor:getvisitordata"));
    return response;
  }
};

module.exports = { getvisitordata };
