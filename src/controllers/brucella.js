const { db } = require("../firebase/firebase");

const brucellafiresotre = async (show, chipnum, date) => {
  const docname = `${show}`;
  try {
    const docRef = db
      .collection("shows")
      .doc(docname)
      .collection("dogs")
      .doc(String(chipnum));
    await docRef.set({
      brucella: date,
    });
    return {
      message: "brucella added successfully",
      status: 201,
    };
  } catch (error) {
    console.log(error);
    return {
      message: "brucella not added",
      status: 400,
    };
  }
};

module.exports = { brucellafiresotre };
