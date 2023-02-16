const extractDates = (text) => {
  //regex to match dates in the format dd/mm/yyyy or dd.mm.yyyy
  const regex = /(\d{1,2}\/\d{1,2}\/\d{4})|(\d{1,2}\.\d{1,2}\.\d{4})/g;
  const dates = text.match(regex);
  return dates;
};

// extract the chip number from the text
const extractChip = (text) => {
  // chip number 15 digits long
  const regex = /(\d{15})/g;
  const chip = text.match(regex);
  return chip;
};

const { createWorker } = require("tesseract.js");

const worker = createWorker({
  //   logger: m => console.log(m)
});

const ReadText = async (imgfile, oem, psm) => {
  const oem_var = oem || 2;
  const psm_var = psm || 3;

  try {
    await worker.load();
    console.log("worker loaded");
    await worker.loadLanguage("eng+osd");
    console.log("language loaded");
    await worker.initialize("eng+osd");
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
    console.log("worker recognized");
    return text;
  } catch (e) {
    return `An error occurred: ${e}`;
  } finally {
    await worker.terminate(); // terminate the worker
  }
};

module.exports = { extractDates, extractChip, ReadText };
