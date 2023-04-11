const { db, auth } = require("../firebase/firebase");
const { fixdatetodot } = require("../utils/fixdate");
//const {firebase} = require("firebase")
// make the document name as the show name and date and put no data in it

const createShow = async (KenelClubName, date, desc) => {
  date = fixdatetodot(date);
  const show = await db.collection("shows").doc(`${KenelClubName} - ${date}`);
  //set the desc as a field in the show document
  const showdesc = await db
    .collection("shows")
    .doc(`${KenelClubName} - ${date}`);

  try {
    if ((await show.get()).exists) {
      return {
        message: "show already exists",
        status: 400,
      };
    }
    await show.set({});
    await showdesc.set({ desc: desc });
    return {
      message: "show created",
      status: 200,
    };
  } catch (error) {
    return {
      error: error,
      status: 400,
    };
  }
};

//create a func that returns all the shows as objects with the show name and date
const getallshows = async () => {
  //create an array to store the shows names
  const shows = [];
  //get all the shows from the database
  const showsdata = await db.collection("shows").get();
  //split the show name and date
  showsdata.forEach((show) => {
    const showname = show.id.split(" - ");
    shows.push({
      name: showname[0],
      date: showname[1],
      desc: show.data().desc,
    });
  });
  //return the array
  return {
    shows: shows,
    message: "shows returned",
    status: 200,
  };
};

//create a func that gets show object and delte it from the database
const deleteShow = async (show) => {
  console.log(show);
  console.log("in func");
  const showname = `${show.name} - ${show.date}`;
  const showdoc = await db.collection("shows").doc(`${showname}`);
  try {
    if (!(await showdoc.get()).exists) {
      return {
        message: "show does not exist",
        status: 400,
      };
    }
    await showdoc.delete();
    return {
      message: "show deleted",
      status: 200,
    };
  } catch (error) {
    return {
      error: error,
      status: 400,
    };
  }
};
//create a func that gets a old show object and a new show object and updates the old show with the new one replacing the name and date and the desc
// withouth deleting the content of the old show, just update name and date and desc

const updateshow = async (oldshow, updatedshow) => {
  console.log(oldshow, updatedshow);
  const oldshowname = `${oldshow.name} - ${oldshow.date}`;
  const oldshowdoc = await db.collection("shows").doc(`${oldshowname}`);
  updatedshow.date = fixdatetodot(updatedshow.date);
  const newshowname = `${updatedshow.name} - ${updatedshow.date}`;
  const newshowdoc = await db.collection("shows").doc(`${newshowname}`);
  //update the old show with the new one
  try {
    if (!(await oldshowdoc.get()).exists) {
      return {
        message: "show does not exist",
        status: 400,
      };
    }
    await newshowdoc.set({
      desc: updatedshow.desc,
    });
    await oldshowdoc.delete();
    return {
      message: "show updated",
      status: 200,
    };
  } catch (error) {
    return {
      error: error,
      status: 400,
    };
  }
};
module.exports = {
  createShow,
  getallshows,
  deleteShow,
  updateshow,
};
