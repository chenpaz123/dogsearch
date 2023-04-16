const { db } = require("../firebase/firebase");

/**
 * The brucellafiresotre function saves a brucella test date to the Firestore
 * database for a specific dog, associated with a specific show.
 *
 * @param {string} show - The name of the show.
 * @param {string} chipnum - The chip number of the dog.
 * @param {string} date - The brucella test date.
 * @returns {Promise<Object>} A Promise that resolves to an object containing:
 *  - message: {string} A description of the status.
 *  - status: {number} A status code indicating the success or failure of the operation.
 *
 * @throws {Error} Throws an error if an issue occurs during the database operation.
 */
const brucellafiresotre = async (show, chipnum, date) => {
  const docname = `${show}`;
  try {
    // Reference the Firestore document for the specified show and dog
    const docRef = db
      .collection("shows")
      .doc(docname)
      .collection("dogs")
      .doc(String(chipnum));

    // Set the brucella test date for the dog
    await docRef.set({
      brucella: date,
    });

    // Return a success message and status code
    return {
      message: "brucella added successfully",
      status: 201,
    };
  } catch (error) {
    // Log any errors that occur during the database operation
    console.log(error);

    // Return an error message and status code
    return {
      message: "brucella not added",
      status: 400,
    };
  }
};

module.exports = { brucellafiresotre };
