/**
 * The getvisitordata function processes an image containing a Brucella test result,
 * validates the test information, and returns an object containing the validation
 * status and relevant information.
 *
 * @param {string} showdate - The date of the show.
 * @param {string} image - The input image containing the Brucella test result.
 * @param {string} chipnum - The chip number to be validated.
 * @returns {Object} An object containing the following properties:
 *  - status: {number} A status code indicating the success or failure of the operation.
 *  - message: {string} A description of the status.
 *  - date: {string} The extracted date, if any.
 *  - chip: {string} The extracted chip number, if any.
 *  - result: {boolean} A boolean value representing whether the test result is negative (true) or not (false).
 *
 * Possible status codes and messages:
 *  - 201: brucella is valid
 *  - 400: brucella not added
 *  - 401: אין מספר שבב (No chip number)
 *  - 402: ברוצלה לא בתוקף (Brucella not valid)
 *  - 403: אין תאריך ברוצלה (No Brucella date)
 *  - 405: אין תמונה (No image)
 *  - 406: מספר שבב לא תואם (Chip number does not match)
 *  - 407: ברוצלה לא שלילית (Brucella not negative)
 */

// Import required modules
const { ocr } = require("../controllers/ocr");
const { GetBrucellaValid } = require("../utils/hisunvalid");
const { fixdate } = require("../utils/fixdate");

// Define the main getvisitordata function
const getvisitordata = async ({ showdate, image, chipnum }) => {
  try {
    console.log(showdate, image);
    // Check if image is undefined, return an error status and message if true
    if (image == undefined) {
      return {
        status: 405,
        message: "אין תמונה",
      };
    }
    // Call the OCR function to get the date and chip number
    const { date, chip, result } = await ocr(image);
    // Check if the chip number matches the provided chip number
    if (chip != chipnum) {
      return {
        status: 406,
        message: "מספר שבב לא תואם",
      };
    }
    // Check if the Brucella test result is negative
    if (!result) {
      return {
        status: 407,
        message: "ברוצלה לא שלילית",
        chip: chip,
        date: date2,
        result: result,
      };
    }
    // Fix the date format using the fixdate utility function
    console.log("og date" + date);
    date2 = fixdate(date);
    console.log(date, date2);
    console.log(date2, chip);

    console.log("date from ocr" + date2);
    console.log("showdate" + showdate);
    console.log("chip from ocr" + chip);

    // Check if the Brucella date is valid by comparing it to the show date
    const BrucellaValid = GetBrucellaValid(date2, showdate);
    console.log("brucella valid" + BrucellaValid);
    // Check for various error conditions and return
    // appropriate status codes and messages
    if (chip == undefined) {
      return {
        status: 401,
        message: "אין מספר שבב",
        date: date2,
      };
    }
    if (!BrucellaValid) {
      console.log("not valid");
      return {
        status: 402,
        message: "ברוצלה לא בתוקף",
        chip: chip,
        date: date2,
      };
    }
    if (date == undefined) {
      return {
        status: 403,
        message: "אין תאריך ברוצלה",
        chip: chip,
      };
    }
    // If all conditions are met, return a success status code and message
    if (BrucellaValid && chip !== undefined && date !== undefined) {
      console.log("valid");
      return {
        message: "brucella is valid",
        status: 201,
        chip: chip,
        date: date2,
        result: result,
      };
    } else {
      console.log("not valid");
      return {
        message: "brucella is not valid",
        status: 400,
        chip: chip,
        date: date2,
        result: result,
      };
    }
  } catch (error) {
    console.log(error);
    // Return an error status and message if an exception occurs
    return {
      message: "brucella not added",
      status: 400,
    };
  }
};

// Export the getvisitordata function
module.exports = { getvisitordata };

/*
getvisitordata({
  show: "תערוכה בין לאומית - 26.05.2022",
  image:
    "C:\\Users\\chenp\\OneDrive\\Documents\\Project\\projecto\\node js\\src\\test.jpg",
});*/
