/**
 * Extracts dates from a given text string.
 *
 * @function extractDates
 * @param {string} text - The input text.
 * @returns {Array<string>} An array of date strings.
 */
const extractDates = (text) => {
  //regex to match dates in the format dd/mm/yyyy or dd.mm.yyyy
  const regex = /(\d{1,2}\/\d{1,2}\/\d{4})|(\d{1,2}\.\d{1,2}\.\d{4})/g;
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
  // Define a regex pattern to match the words "שלילי" or "negative"
  const regex = /(Negative|NEGATIVE|negative|שלילי)/gi;
  const result = text.match(regex);
  return result;
};

const { createWorker } = require("tesseract.js");

const worker = createWorker({
  //   logger: m => console.log(m)
});
/**
 * Reads the text from an image file using Tesseract.js.
 *
 * @async
 * @function ReadText
 * @param {Buffer} imgfile - The input image file.
 * @param {number} [oem=2] - The OCR Engine mode.
 * @param {number} [psm=3] - The page segmentation mode.
 * @returns {Promise<string>} A promise that resolves to the extracted text.
 */
const ReadText = async (imgfile, oem, psm) => {
  const oem_var = oem || 2;
  const psm_var = psm || 3;

  try {
    await worker.load();
    console.log("worker loaded");
    await worker.loadLanguage("eng+osd+heb");
    console.log("language loaded");
    await worker.initialize("eng+osd+heb");
    console.log("worker initialized");
    await worker.setParameters({
      tessedit_ocr_engine_mode: oem_var,
      tessedit_pageseg_mode: psm_var,
      // tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    });
    console.log("worker parameters set");
    const {
      data: { text },
    } = await worker.recognize(imgfile, {
      // tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
    });
    console.log(text);
    console.log("worker recognized");
    return text;
  } catch (e) {
    return `An error occurred: ${e}`;
  } finally {
    await worker.terminate(); // terminate the worker
  }
};

module.exports = { extractDates, extractChip, extractResult, ReadText };
