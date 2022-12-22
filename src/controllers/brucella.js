const { db } = require("../firebase/firebase");

const brucellafiresotre = async (chipnum, date, KenelClubName, ShowDate) => {
  ShowDate = ShowDate.replace(/\//g, ".");
  const docname = `${KenelClubName} - ${ShowDate}`;
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
