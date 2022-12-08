//get the show date, the kennel club name and the image from visitor interface
const { ocr } = require("../controllers/ocr");
const { GetBrucellaValid } = require("../utils/hisunvalid");

const getvisitordata = async ({ showdate, kennelclubname, image }) => {
  try {
    console.log(showdate, kennelclubname, image);
    //call the ocr function to get the date and the chip number
    const { date, chip } = await ocr(image);
    console.log(date, chip);
    //call the GetHisunValid function to check if the date is valid
    const BrucellaValid = GetBrucellaValid(date, showdate);
    if (chip == undefined) {
      return {
        status: 401,
        message: "אין מספר שבב",
      };
    }
    if (BrucellaValid == false) {
      return {
        status: 402,
        message: "ברוצלה לא בתוקף",
      };
    }
    if (date == undefined) {
      return {
        status: 403,
        message: "אין תאריך ברוצלה",
      };
    }

    if (BrucellaValid && chip !== undefined && date !== undefined) {
      console.log("valid");
      return {
        message: "brucella is valid",
        status: 201,
        chip: chip,
        date: date,
      };
    } else {
      console.log("not valid");
      return {
        message: "brucella is not valid",
        status: 400,
        chip: chip,
        date: date,
      };
    }
  } catch (error) {
    console.log(error);
    return {
      message: "brucella not added",
      status: 400,
    };
  }
};

module.exports = { getvisitordata };
