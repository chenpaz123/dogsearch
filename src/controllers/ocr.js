const ReadText = require("text-from-image");
const { extractDates, extractChip } = require("../utils/ocr");

// const image =
//   "C:\\Users\\chenp\\OneDrive\\Documents\\Project\\projecto\\test.jpg";

const ocr = async (image) => {
  console.log("ocr started");
  const text = await ReadText(image);
  const dates = extractDates(text);
  const chip = extractChip(text);
  if (chip == null && dates == null) {
    return {
      status: 400,
      message: "no chip number or date",
    };
  }
  var date, chip1;
  if (dates !== null) {
    date = dates[dates.length - 1];
    console.log("date: ", date);
  } else {
    console.log("no date found");
    return {
      message: "no date found",
      status: 400,
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
      status: 400,
      date: dates[0],
    };
  }
  console.log("ocr ended");
  return {
    message: "OCR done",
    status: 200,
    date: date,
    chip: chip1,
  };
};

// ocr(image);

module.exports = { ocr };
