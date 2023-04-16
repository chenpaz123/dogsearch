const { db } = require("../firebase/firebase");
const { fixdatetodot } = require("../utils/fixdate");
/**
 * Creates a new show in the database with a given showName and date.
 *
 * @param {string} showName - The name of the show.
 * @param {string} date - The date of the show.
 * @param {string} desc - The description of the show.
 * @returns {Object} An object containing a status code and a message.
 */

const createShow = async (showName, date, desc) => {
  date = fixdatetodot(date);
  const show = await db.collection("shows").doc(`${showName} - ${date}`);
  //set the desc as a field in the show document
  const showdesc = await db
    .collection("shows")
    .doc(`${showName} - ${date}`);

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

/**
 * Retrieves all the shows from the database.
 *
 * @returns {Object} An object containing a status code, a message, and an array of show objects.
 */
const getallshows = async () => {
  //create an array to store the shows names
  const shows = [];
  //get all the shows from the database
  const showsdata = await db.collection("shows").get();
  //check if there are any shows
  if (showsdata.empty) {
    return {
      shows: shows,
      message: "no shows available",
      status: 400,
    };
  } else {
    //split the show name and date
    showsdata.forEach((show) => {
      const showName = show.id.split(" - ");
      shows.push({
        name: showName[0],
        date: showName[1],
        desc: show.data().desc,
      });
    });
    //return the array
    return {
      shows: shows,
      message: "shows returned",
      status: 200,
    };
  }
};

/**
 * Deletes a show from the database.
 *
 * @param {Object} show - The show object to be deleted.
 * @returns {Object} An object containing a status code and a message.
 */
const deleteShow = async (show) => {
  console.log(show);
  console.log("in func");
  const showName = `${show.name} - ${show.date}`;
  const showdoc = await db.collection("shows").doc(`${showName}`);
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
/**
 * Updates an existing show in the database with new information.
 *
 * @param {Object} oldshow - The old show object to be updated.
 * @param {Object} updatedshow - The new show object containing updated information.
 * @returns {Object} An object containing a status code and a message.
 */

const updateshow = async (oldshow, updatedshow) => {
  console.log(oldshow, updatedshow);
  const oldshowName = `${oldshow.name} - ${oldshow.date}`;
  const oldshowdoc = await db.collection("shows").doc(`${oldshowName}`);
  updatedshow.date = fixdatetodot(updatedshow.date);
  const newshowName = `${updatedshow.name} - ${updatedshow.date}`;
  const newshowdoc = await db.collection("shows").doc(`${newshowName}`);
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
