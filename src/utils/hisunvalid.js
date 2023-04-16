const moment = require("moment");

/**
 * Determines if a given hisun date is valid by checking if it's within 365 days from today.
 *
 * @function GetHisunValid
 * @param {string} hisundate - The input hisun date in "DD/MM/YYYY" format.
 * @returns {boolean} True if the hisun date is valid, false otherwise.
 */
const GetHisunValid = (hisundate) => {
  var hisun = moment(hisundate, "DD/MM/YYYY");
  var today = moment();
  var diff = today.diff(hisun, "days");
  console.log(diff);
  if (diff <= 365 && diff >= 0) {
    return true;
  } else {
    return false;
  }
};

/**
 * Determines if a hisun date is valid by checking if it's within 365 days from the provided show date.
 *
 * @function GetBrucellaValid
 * @param {string} hisundate - The input hisun date in "DD/MM/YYYY" format.
 * @param {string} showdate - The input show date in "DD/MM/YYYY" format.
 * @returns {boolean} True if the hisun date is valid, false otherwise.
 */
const GetBrucellaValid = (hisundate, showdate) => {
  console.log(hisundate, showdate);
  var hisun = moment(hisundate, "DD/MM/YYYY");
  var showdate = moment(showdate, "DD/MM/YYYY");
  console.log(hisun, showdate);
  var diff = showdate.diff(hisun, "days");
  console.log(diff);
  if (diff <= 365 && diff >= 0) {
    return true;
  } else {
    return false;
  }
};

module.exports = { GetHisunValid, GetBrucellaValid };
