const moment = require("moment");
const { parseDateLike } = require("./date-formatter.util");

const normaliseToDay = (value) => value.clone().startOf("day");

/**
 * Determines if a given hisun date is valid by checking if it's within 365 days from today.
 * @param {string|Date|moment.Moment} hisundate - The hisun date.
 * @returns {boolean} True if the hisun date is valid, false otherwise.
 */
const GetHisunValid = (hisundate) => {
  const hisunMoment = parseDateLike(hisundate);
  if (!hisunMoment) {
    return false;
  }

  const today = normaliseToDay(moment());
  const diff = today.diff(hisunMoment, "days");
  return diff <= 365 && diff >= 0;
};

/**
 * Determines if a hisun date is valid by checking if it's within 365 days from the provided show date.
 * @param {string|Date|moment.Moment} hisundate - The hisun/brucella date.
 * @param {string|Date|moment.Moment} showdate - The show date.
 * @returns {boolean} True if the hisun date is valid for the show date, false otherwise.
 */
const GetBrucellaValid = (hisundate, showdate) => {
  const hisunMoment = parseDateLike(hisundate);
  const showMoment = parseDateLike(showdate);

  if (!hisunMoment || !showMoment) {
    return false;
  }

  const diff = showMoment.diff(hisunMoment, "days");
  return diff <= 365 && diff >= 0;
};

module.exports = { GetHisunValid, GetBrucellaValid };
