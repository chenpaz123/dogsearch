const {
  extractDates,
  extractChip,
  extractResult,
  ReadText,
} = require("../utils/ocr.js");

//const image =
//"C:\\Users\\chenp\\OneDrive\\Documents\\Project\\projecto\\test.jpg";

const ocr = async (image) => {
  console.log("ocr started");
  const text = await ReadText(image);
  const dates = extractDates(text);
  const chip = extractChip(text);
  const result = extractResult(text);
  console.log("result: ", result);
  if (chip == null && dates == null) {
    return {
      status: 400,
      message: "no chip number or date",
    };
  }
  var date, chip1;
  console.log("dates: ", dates);
  if (dates !== null) {
    date = dates[dates.length - 1];
    console.log("date: ", date);
  } else {
    console.log("no date found");
    return {
      message: "no date found",
      status: 403,
      chip: chip[0],
    };
  }
  if (chip !== null) {
    chip1 = chip[0];
    console.log("chip: ", chip1);
  } else {
    console.log("no chip found");
    return {
      message: "no chip found",
      status: 401,
      date: date,
    };
  }
  if (result == null) {
    console.log("result: ", result);
    return {
      message: "הבדיקה לא שלילית",
      status: 407,
      date: date,
      chip: chip1,
      result: false,
    };
  }
  console.log("ocr ended");
  return {
    message: "OCR done",
    status: 200,
    date: date,
    chip: chip1,
    result: true,
  };
};

//ocr(image);

module.exports = { ocr };
