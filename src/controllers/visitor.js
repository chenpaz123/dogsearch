//get the show date, the kennel club name and the image from visitor interface
const { ocr } = require("../controllers/ocr");
const { GetBrucellaValid } = require("../utils/hisunvalid");

const getvisitordata = async ({ showdate, kennelclubname, image }) => {
  try {
    console.log(showdate, kennelclubname, image);
    if (image == undefined) {
      return {
        status: 405,
        message: "אין תמונה",
      };
    }
    //call the ocr function to get the date and the chip number
    const { date, chip } = await ocr(image);
    date2 = fixdate(date);
    console.log(date2, chip);
    //call the GetHisunValid function to check if the date is valid
    const BrucellaValid = GetBrucellaValid(date2, showdate);
    if (chip == undefined) {
      return {
        status: 401,
        message: "אין מספר שבב",
        date: date2,
      };
    }
    if (BrucellaValid == false) {
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

    if (BrucellaValid && chip !== undefined && date !== undefined) {
      console.log("valid");
      return {
        message: "brucella is valid",
        status: 201,
        chip: chip,
        date: date2,
      };
    } else {
      console.log("not valid");
      return {
        message: "brucella is not valid",
        status: 400,
        chip: chip,
        date: date2,
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

function fixdate(date) {
  const moment = require("moment");
  const datesformats = [
    "DD/MM/YYYY",
    "DD.MM.YYYY",
    "DD-MM-YYYY",
    "DD/MM/YY",
    "DD.MM.YY",
    "DD-MM-YY",
    "DD/MM",
    "DD.MM",
    "DD-MM",
    "DD/MM/YY",
    "DD.MM.YY",
    "DD-MM-YY",
  ];

  for (let i = 0; i < datesformats.length; i++) {
    const date2 = moment(date, datesformats[i], true);
    if (date2.isValid()) {
      return date2.format("DD/MM/YYYY");
    }
  }
}

module.exports = { getvisitordata };
