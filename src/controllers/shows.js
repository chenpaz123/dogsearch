const moment = require("moment");
const { db } = require("../firebase/firebase");

const addshow = async ({ KenelClubName }) => {
  ShowDate = moment(Date.now()).format("DD.MM.YYYY");
  const docname = `${KenelClubName} - ${ShowDate}`;
  console.log(ShowDate);
  console.log(docname);
  try {
    const docRef = db.collection("shows").doc(docname);
    await docRef.set({
      KenelClubName: KenelClubName,
      ShowDate: ShowDate,
    });
    return {
      message: "Show added successfully",
      status: 201,
    };
  } catch (error) {
    console.log(error);
    return {
      message: "Show not added",
      status: 400,
    };
  }
};

module.exports = { addshow };
