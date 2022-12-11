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
  const date1 = moment(date, "DD/MM/YYYY");
  const date2 = moment(date, "DD.MM.YYYY");
  const date3 = moment(date, "DD-MM-YYYY");
  const date4 = moment(date, "DD/MM/YY");
  const date5 = moment(date, "DD.MM.YY");
  const date6 = moment(date, "DD-MM-YY");
  const date7 = moment(date, "DD/MM");
  const date8 = moment(date, "DD.MM");
  const date9 = moment(date, "DD-MM");
  const date10 = moment(date, "DD/MM/YY");
  const date11 = moment(date, "DD.MM.YY");
  const date12 = moment(date, "DD-MM-YY");

  if (date1.isValid()) {
    return date1.format("DD/MM/YYYY");
  }
  if (date2.isValid()) {
    return date2.format("DD/MM/YYYY");
  }
  if (date3.isValid()) {
    return date3.format("DD/MM/YYYY");
  }
  if (date4.isValid()) {
    return date4.format("DD/MM/YYYY");
  }
  if (date5.isValid()) {
    return date5.format("DD/MM/YYYY");
  }
  if (date6.isValid()) {
    return date6.format("DD/MM/YYYY");
  }
  if (date7.isValid()) {
    return date7.format("DD/MM/YYYY");
  }
  if (date8.isValid()) {
    return date8.format("DD/MM/YYYY");
  }
  if (date9.isValid()) {
    return date9.format("DD/MM/YYYY");
  }
  if (date10.isValid()) {
    return date10.format("DD/MM/YYYY");
  }
  if (date11.isValid()) {
    return date11.format("DD/MM/YYYY");
  }
  if (date12.isValid()) {
    return date12.format("DD/MM/YYYY");
  }
}

module.exports = { getvisitordata };
