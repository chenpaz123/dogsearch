const {
  extractDates,
  extractChip,
  extractResult,
  ReadText,
} = require("../utils/ocr.js");

/**
 * The ocr function takes an image and uses OCR (Optical Character Recognition)
 * to extract information such as dates, chip number, and test result.
 *
 * @param {Object} image - The input image.
 * @returns {Object} An object containing the following properties:
 *  - status: {number} A status code indicating the success or failure of the operation.
 *  - message: {string} A description of the status.
 *  - date: {string} The extracted date, if any.
 *  - chip: {string} The extracted chip number, if any.
 *  - result: {boolean} A boolean value representing whether the test result is negative (true) or not (false).
 *
 * Possible status codes and messages:
 *  - 200: OCR done
 *  - 400: no chip number or date
 *  - 401: no chip found
 *  - 403: no date found
 *  - 407: הבדיקה לא שלילית (The test is not negative)
 */
// The ocr function takes an image and uses OCR (Optical Character Recognition)
// to extract information such as dates, chip number, and test result.
const ocr = async (image) => {
  console.log("ocr started");

  // Read text from the image using OCR
  const text = await ReadText(image);

  // Extract dates, chip number, and test result from the OCR text
  const dates = extractDates(text);
  const chip = extractChip(text);
  const result = extractResult(text);

  console.log("result: ", result);

  // If both chip number and dates are not found, return an error status
  if (chip == null && dates == null) {
    return {
      status: 400,
      message: "no chip number or date",
    };
  }

  console.log("dates: ", dates);

  // If dates are found, set the date variable
  if (dates !== null) {
    date = dates[0];
    console.log("date: ", date);
  } else {
    // If no dates are found, return an error status with the extracted chip number
    console.log("no date found");
    return {
      message: "no date found",
      status: 403,
      chip: chip[0],
    };
  }

  // If a chip number is found, set the chip1 variable
  if (chip !== null) {
    chip1 = chip[0];
    console.log("chip: ", chip1);
  } else {
    // If no chip number is found, return an error status with the extracted date
    console.log("no chip found");
    return {
      message: "no chip found",
      status: 401,
      date: date,
    };
  }

  // If the test result is not negative, return an error status with the extracted data
  if (result !== "negative") {
    console.log("הבדיקה לא שלילית");
    return {
      message: "הבדיקה לא שלילית",
      status: 407,
      date: date,
      chip: chip1,
      result: false,
    };
  }

  console.log("ocr ended");

  // If all the data is successfully extracted, return a success status with the extracted data
  return {
    message: "OCR done",
    status: 200,
    date: date,
    chip: chip1,
    result: true,
  };
};
// export the ocr function
module.exports = { ocr };
//ocr(image);
//const image =
//"C:\\Users\\chenp\\OneDrive\\Documents\\Project\\projecto\\test.jpg";
