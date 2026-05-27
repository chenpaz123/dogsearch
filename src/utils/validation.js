/**
 * Validates a string to ensure it only contains allowed characters:
 * Alphanumeric, Hebrew characters, spaces, dashes, and dots.
 * This helps prevent path traversal or injection when the input
 * is used to construct database paths or IDs.
 *
 * @param {string} str - The input string to validate.
 * @returns {boolean} - True if the input is valid or empty, false otherwise.
 */
const isValidInput = (str) => {
  if (typeof str !== "string") {
    return false;
  }
  // Allow empty string to pass if needed, or handle it here
  if (str.length === 0) {
    return false; // Typically we don't want empty strings for show names
  }
  const regex = /^[a-zA-Z0-9\u0590-\u05EA\s\-\.]+$/;
  return regex.test(str);
};

module.exports = { isValidInput };
