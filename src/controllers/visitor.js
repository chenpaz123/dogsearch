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
    date2 = fixdate(date);
    console.log(date, date2);
    console.log(date2, chip);
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
