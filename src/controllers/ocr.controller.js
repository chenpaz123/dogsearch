const { markStart, markEnd, logPerf } = require("../utils/performance.util");
const {
  extractDates,
  extractChip,
  extractResult,
  ReadText,
} = require("../utils/ocr.util");
const { createLogger } = require("../utils/logger.util");

const logger = createLogger("controller:ocr");

const normaliseResult = (value) => (value || "").toString().toLowerCase();

const buildErrorResponse = (status, message) => ({
  status,
  message,
});

/**
 * Processes an image using OCR to extract date and chip number.
 *
 * @param {string} image - The image data (base64 or buffer).
 * @returns {Promise<Object>} The result object containing status, message, date, chip, and result.
 */
const ocr = async (image) => {
  markStart("ocr:total");
  let text;
  try {
    markStart("ocr:read");
    text = await ReadText(image);
    logPerf(markEnd("ocr:read"));
  } catch (error) {
    logger.error("ocr failed", { error });
    logPerf(markEnd("ocr:read"));

    const status =
      error?.statusCode ||
      (error?.message?.toLowerCase().includes("image") ? 400 : 500);

    const message =
      status === 429
        ? "Too many OCR requests. Please try again later."
        : error?.message?.toString() || "ocr processing failed";

    const result = buildErrorResponse(status, message);
    logPerf(markEnd("ocr:total"));
    return result;
  }

  const dates = extractDates(text) || [];
  const chips = extractChip(text) || [];
  const result = normaliseResult(extractResult(text));

  if (chips.length === 0 && dates.length === 0) {
    const response = buildErrorResponse(400, "no chip number or date");
    logPerf(markEnd("ocr:total"));
    return response;
  }

  const date = dates[0];
  if (!date) {
    const response = {
      message: "no date found",
      status: 403,
      chip: chips[0],
    };
    logPerf(markEnd("ocr:total"));
    return response;
  }

  const chip = chips[0];
  if (!chip) {
    const response = {
      message: "no chip found",
      status: 400,
      date,
    };
    logPerf(markEnd("ocr:total"));
    return response;
  }

  if (result === "unknown") {
    const response = {
      message: "could not determine brucella result",
      status: 422,
      date,
      chip,
      result: false,
    };
    logPerf(markEnd("ocr:total"));
    return response;
  }

  if (result !== "negative") {
    const response = {
      message: "brucella result not negative",
      status: 422,
      date,
      chip,
      result: false,
    };
    logPerf(markEnd("ocr:total"));
    return response;
  }

  const success = {
    message: "OCR done",
    status: 200,
    date,
    chip,
    result: true,
  };
  logPerf(markEnd("ocr:total"));
  return success;
};

module.exports = { ocr };
