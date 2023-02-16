const moment = require("moment");

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

// rebuild the same function but compare 2 dates

const GetBrucellaValid = (hisundate, showdate) => {
  var hisun = moment(hisundate, "DD/MM/YYYY");
  var showdate = moment(showdate, "DD/MM/YYYY");
  var diff = showdate.diff(hisun, "days");
  console.log(diff);
  if (diff <= 365 && diff >= 0) {
    return true;
  } else {
    return false;
  }
};

module.exports = { GetHisunValid, GetBrucellaValid };
