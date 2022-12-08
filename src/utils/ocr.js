const extractDates = (text) => {
  //regex to match dates in the format dd/mm/yyyy or dd.mm.yyyy
  const regex = /(\d{1,2}\/\d{1,2}\/\d{4})|(\d{1,2}\.\d{1,2}\.\d{4})/g;
  const dates = text.match(regex);
  return dates;
};

// extract the chip number from the text
const extractChip = (text) => {
  // chip number 15 digits long
  const regex = /(\d{15})/g;
  const chip = text.match(regex);
  return chip;
};

module.exports = { extractDates, extractChip };
