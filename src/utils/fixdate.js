const moment = require("moment");
/**
 * Converts a date string to the format "DD/MM/YYYY".
 *
 * @function fixdate
 * @param {string} date - The input date string in various formats.
 * @returns {string} The formatted date string in "DD/MM/YYYY" format.
 */

function fixdate(date) {
  console.log("in fix date");
  console.log(date);
  const datesformats = [
    "DD/MM/YYYY",
    "DD.MM.YYYY",
    "DD-MM-YYYY",
    "DD/M/YYYY",
    "DD.M.YYYY",
    "DD-M-YYYY",
    "DD/MM/YY",
    "DD.MM.YY",
    "DD-MM-YY",
    "DD/M/YY",
    "DD.M.YY",
    "DD-M-YY",
    "DD/MM",
    "DD.MM",
    "DD-MM",
    "DD/M",
    "DD.M",
    "DD-M",
    "DD/MM/YY",
    "DD.MM.YY",
    "DD-MM-YY",
    "YYYY/MM/DD",
    "YYYY.MM.DD",
    "YYYY-MM-DD",
    "YYYY/M/DD",
    "YYYY.M.DD",
    "YYYY-M-DD",
    "YY/MM/DD",
    "YY.MM.DD",
    "YY-MM-DD",
    "YY/M/DD",
    "YY.M.DD",
    "YY-M-DD",
  ];

  for (let i = 0; i < datesformats.length; i++) {
    const date2 = moment(date, datesformats[i], true);
    console.log("date2: ", date2);
    if (date2.isValid()) {
      console.log("date2: ", date2.format("DD/MM/YYYY"));
      return date2.format("DD/MM/YYYY");
    }
  }
}
/**
 * Converts a date string to the format "DD.MM.YYYY".
 *
 * @function fixdatetodot
 * @param {string} date - The input date string in various formats.
 * @returns {string} The formatted date string in "DD.MM.YYYY" format.
 */
function fixdatetodot(date) {
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
    "YYYY/MM/DD",
    "YYYY.MM.DD",
    "YYYY-MM-DD",
    "YY/MM/DD",
    "YY.MM.DD",
    "YY-MM-DD",
  ];

  for (let i = 0; i < datesformats.length; i++) {
    const date2 = moment(date, datesformats[i], true);
    if (date2.isValid()) {
      return date2.format("DD.MM.YYYY");
    }
  }
}

module.exports = { fixdate, fixdatetodot };
