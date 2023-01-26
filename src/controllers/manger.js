// make a function that gets show name and date and create it in the database
const e = require("express");
const { db } = require("../firebase/firebase");
// make the document name as the show name and date and put no data in it
const createShow = async (KenelClubName, date) => {
  const show = await db.collection("shows").doc(`${KenelClubName} - ${date}`);
  try {
    await show.set({});
    return {
      message: "show created",
      status: 200,
    };
  } catch (error) {
    return {
      message: "show already exists",
      status: 400,
    };
  }
};

// create a func that gets show name and date and updates it on the database

const updateshow = async (KenelClubName, date, newkennelclub, newdate) => {
  const show = await db.collection("shows").doc(`${KenelClubName} - ${date}`);
  const newshow = await db
    .collection("shows")
    .doc(`${newkennelclub} - ${newdate}`);
  //replace the old show with the new one
  try {
    const data = await show.get();
    await newshow.set(data.data());
    await show.delete();
    return {
      message: "show updated",
      status: 200,
    };
  } catch (error) {
    return {
      message: "show does not exist",
      status: 400,
    };
  }
};

// create a func that gets show name and date and delete it from the database
const deleteShow = async (KenelClubName, date) => {
  const show = await db.collection("shows").doc(`${KenelClubName} - ${date}`);
  try {
    await show.delete();
    return {
      message: "show deleted",
      status: 200,
    };
  } catch (error) {
    return {
      message: "show does not exist",
      status: 400,
    };
  }
};

module.exports = { createShow, updateshow, deleteShow };
