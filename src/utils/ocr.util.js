/**
 * Extracts dates from a given text string.
 *
 * @function extractDates
 * @param {string} text - The input text.
 * @returns {Array<string>} An array of date strings.
 */
const extractDates = (text) => {
  //regex to match dates in the format dd/mm/yyyy or dd.mm.yyyy
  const regex = /(\d{1,2}\/\d{1,2}\/\d{2,4})|(\d{1,2}\.\d{1,2}\.\d{2,4})/g;
  const dates = text.match(regex);
  return dates;
};

/**
 * Extracts a 15-digit chip number from a given text string.
 *
 * @function extractChip
 * @param {string} text - The input text.
 * @returns {Array<string>} An array of chip numbers.
 */
const extractChip = (text) => {
  // chip number 15 digits long
  const regex = /(\d{15})/g;
  const chip = text.match(regex);
  return chip;
};
/**
 * Extracts negative results in different languages from a given text string.
 *
 * @function extractResult
 * @param {string} text - The input text.
 * @returns {Array<string>} An array of strings containing negative results.
 */
const extractResult = (text) => {
  const negregex = /(negative|negativo|negatif|שלילי)/gi;
  const posregex = /(positive|positivo|positif|חיובי)/gi;
  if (text.match(negregex) != null) {
    return "negative";
  } else if (text.match(posregex) != null) {
    return "positive";
  } else {
    return "unknown";
  }
};

const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const { createWorker } = require("tesseract.js");
const { createLogger } = require("./logger.util");

const logger = createLogger("utils:ocr");

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const resolveImageSource = async (imgfile) => {
  if (!imgfile) {
    throw new Error("no image provided");
  }

  if (Buffer.isBuffer(imgfile)) {
    return imgfile;
  }

  if (typeof imgfile !== "string") {
    throw new Error("unsupported image input type");
  }

  const trimmed = imgfile.trim();

  if (trimmed.startsWith("data:image")) {
    const base64Part = trimmed.split(",")[1];
    if (!base64Part) {
      throw new Error("invalid data URI provided");
    }
    return Buffer.from(base64Part, "base64");
  }

  if (/^https?:\/\//i.test(trimmed)) {
    const maxRetries = 2;
    let lastResponse;
    for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
      const response = await fetch(trimmed);
      lastResponse = response;
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
      }

      if (response.status === 429 && attempt < maxRetries) {
        const retryAfterHeader = response.headers.get("retry-after");
        const retryAfterSeconds = parseInt(retryAfterHeader || "", 10);
        const delayMs = Number.isFinite(retryAfterSeconds)
          ? retryAfterSeconds * 1000
          : 1000 * (attempt + 1);
        await wait(delayMs);
        continue;
      }

      break;
    }

    if (lastResponse) {
      const error = new Error("failed to fetch image");
      error.statusCode = lastResponse.status;
      error.statusText = lastResponse.statusText;
      try {
        const bodyPreview = await lastResponse.text();
        if (bodyPreview) {
          error.statusBody = bodyPreview.slice(0, 2000);
        }
      } catch (bodyErr) {
        error.statusBody = bodyErr.message;
      }
      throw error;
    }

    throw new Error("failed to fetch image");
  }

  const localCandidates = [
    trimmed,
    path.resolve(trimmed),
    path.join(process.cwd(), trimmed),
    path.join(__dirname, "..", trimmed),
  ];

  for (const candidate of localCandidates) {
    try {
      if (fs.existsSync(candidate)) {
        return candidate;
      }
    } catch (error) {
      // continue to next candidate
    }
  }

  // If not a local file, and looks like base64 (long string), convert to buffer
  // This handles cases where raw base64 is passed without data URI prefix
  if (trimmed.length > 260) {
    // Max path length is usually 260 chars on Windows
    try {
      // Simple check if it's base64-ish (no spaces, valid chars)
      // But Buffer.from will handle it.
      return Buffer.from(trimmed, "base64");
    } catch (e) {
      // ignore
    }
  }

  return trimmed;
};
/**
 * Reads the text from an image file using Tesseract.js.
 *
 * @async
 * Reads text from an image using Tesseract.js.
 *
 * @param {string|Buffer} image - The image to process.
 * @returns {Promise<string>} The extracted text.
 */
const ReadText = async (image, oem, psm) => {
  const oem_var = oem !== undefined ? oem : 1;
  const psm_var = psm || 3;

  // Tesseract.js v6 configuration
  const dataPath = path.join(__dirname, "../../data");
  logger.debug("initializing worker...", {
    oem: oem_var,
    psm: psm_var,
    dataPath,
  });

  const worker = await createWorker("eng+heb", oem_var, {
    langPath: dataPath,
    cachePath: dataPath,
    gzip: false,
    logger: (m) => logger.debug("tesseract progress", m),
  });

  try {
    const imageSource = await resolveImageSource(image);
    logger.info("resolved image source", {
      imageSource: typeof imageSource === "string" ? imageSource : "buffer",
    });

    logger.debug("setting parameters...");
    await worker.setParameters({
      tessedit_pageseg_mode: psm_var,
    });
    logger.debug("worker parameters set", { oem: oem_var, psm: psm_var });

    logger.debug("starting recognition...");
    const {
      data: { text },
    } = await worker.recognize(imageSource);
    logger.debug("worker recognized text", {
      text: text?.slice(0, 100) + "...",
    });
    return text;
  } catch (error) {
    logger.error("OCR worker failed", {
      error: error.message,
      stack: error.stack,
    });
    throw error;
  } finally {
    try {
      if (worker) {
        logger.debug("terminating worker...");
        await worker.terminate();
        logger.debug("worker terminated");
      }
    } catch (terminateError) {
      logger.warn("failed to terminate OCR worker", { error: terminateError });
    }
  }
};

module.exports = { extractDates, extractChip, extractResult, ReadText };
