const moment = require("moment");

const NORMALISED_SLASH_FORMAT = "DD/MM/YYYY";
const NORMALISED_DOT_FORMAT = "DD.MM.YYYY";

const SLASH_FORMATS = [
  "DD/MM/YYYY",
  "D/M/YYYY",
  "DD/M/YYYY",
  "D/MM/YYYY",
  "YYYY/MM/DD",
  "YYYY/M/D",
];

const normaliseMoment = (value) => value.clone().startOf("day");

const parseDateLike = (input) => {
  if (!input && input !== 0) {
    return null;
  }

  if (moment.isMoment(input)) {
    return input.isValid() ? normaliseMoment(input) : null;
  }

  if (input instanceof Date) {
    const dateMoment = moment(input);
    return dateMoment.isValid() ? normaliseMoment(dateMoment) : null;
  }

  if (typeof input !== "string") {
    return null;
  }

  const trimmed = input.trim();
  if (!trimmed) {
    return null;
  }

  const isoCandidate = moment(trimmed, moment.ISO_8601, true);
  if (isoCandidate.isValid()) {
    return normaliseMoment(isoCandidate);
  }

  const normalisedSeparators = trimmed.replace(/[.\-]/g, "/");
  for (const format of SLASH_FORMATS) {
    const candidate = moment(normalisedSeparators, format, true);
    if (candidate.isValid()) {
      return normaliseMoment(candidate);
    }
  }

  return null;
};

const fixdate = (date) => {
  const parsed = parseDateLike(date);
  if (!parsed) {
    return undefined;
  }
  return parsed.format(NORMALISED_SLASH_FORMAT);
};

const fixdatetodot = (date) => {
  const parsed = parseDateLike(date);
  if (!parsed) {
    return undefined;
  }
  return parsed.format(NORMALISED_DOT_FORMAT);
};

module.exports = { fixdate, fixdatetodot, parseDateLike };
