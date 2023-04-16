// Import required modules
const { GetHisunValid } = require("../utils/hisunvalid");
const { db } = require("../firebase/firebase");

/**
 * The addDogToShow function adds a dog to a specific show in the database if the
 * dog's Kalevet and Brucella tests are valid.
 *
 * @param {Object} data - The dog data.
 * @param {string} Show - The name of the show.
 * @returns {Object} An object containing the following properties:
 *  - dog: {Object} The dog data.
 *  - KalevetValid: {boolean} A boolean value indicating if the Kalevet test is valid.
 *  - brucelladate: {string} The Brucella test date.
 *  - BrucellaValid: {boolean} A boolean value indicating if the Brucella test is valid.
 *  - status: {number} A status code indicating the success or failure of the operation.
 *  - message: {string} A description of the status.
 *
 * @throws {Error} Throws an error if an issue occurs during the database operation.
 */
const addDogToShow = async ({
  data, //dog data
  Show, // Show to add the dog to
}) => {
  const docname = `${Show}`;
  // Extract dog information from the data object
  try {
    const dog = data["AnimalDetails"][0]; //dog data
    const ChipNum = data["AnimalDetails"][0]["ChipNumber"]; //chip number
    HisunDate = data["AnimalDetails"][0]["HisunDate"]; // Kalevet hisun date
    IsValid = GetHisunValid(HisunDate); //check if the Kalevet is valid
    console.log(IsValid);
    console.log(dog);

    // Create a reference to the dog document in the database
    const docRef = db
      .collection("shows")
      .doc(docname)
      .collection("dogs")
      .doc(String(ChipNum));

    // Retrieve the dog document from the database
    const doc = await docRef.get();
    // If the Kalevet is valid and the dog document exists in the database,
    //update the dog information
    if (IsValid && doc.exists) {
      await db
        .collection("shows")
        .doc(docname)
        .collection("dogs")
        .doc(String(ChipNum))
        .update(dog);
      brucelladate = doc.data().brucella;
      return {
        dog: dog,
        KalevetValid: IsValid,
        brucelladate: brucelladate,
        BrucellaValid: doc.exists,
        status: 201,
        message: "dog added to the show",
      };
    } else {
      return {
        dog: dog,
        status: 400,
        KalevetValid: IsValid,
        BrucellaValid: doc.exists,
        message: "can't add dog to the show",
      };
    }
  } catch (error) {
    console.log(error);
    // Handle error scenarios
    if (error == "TypeError: Failed to fetch") {
      return {
        KalevetValid: IsValid,
        brucelladate: brucelladate,
        BrucellaValid: doc.exists,
        message: "אין חיבור לאינטרנט",
        status: 500,
      };
    }
    if (
      error == "TypeError: Cannot read properties of undefined (reading '0')"
    ) {
      return {
        message: "מספר השבב שהזנת אינו קיים במערכת",
        status: 404,
      };
    }
  }
};

//const { getdatafrommoagdb } = require("../utils/getdatafrommoagdb");
//chipnum, in pararms
//const data = await getdatafrommoagdb(ChipNum); inttry
