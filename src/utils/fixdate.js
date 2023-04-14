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

function fixdatetodot(date) {
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
