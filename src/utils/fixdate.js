const moment = require("moment");
/**
 * Converts a date string to the format "DD/MM/YYYY".
 *
 * @function fixdate
 * @param {string} date - The input date string in various formats.
 * @returns {string} The formatted date string in "DD/MM/YYYY" format.
 */

function fixdate(date) {
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
