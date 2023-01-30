const { db, auth } = require("../firebase/firebase");
// make the document name as the show name and date and put no data in it
const createShow = async (KenelClubName, date) => {
  const show = await db.collection("shows").doc(`${KenelClubName} - ${date}`);
  try {
    if ((await show.get()).exists) {
      return {
        message: "show already exists",
        status: 400,
      };
    }
    await show.set({});
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

// create a func that gets show name and date and updates it on the database

const updateshow = async (KenelClubName, date, newkennelclub, newdate) => {
  const show = await db.collection("shows").doc(`${KenelClubName} - ${date}`);
  const newshow = await db
    .collection("shows")
    .doc(`${newkennelclub} - ${newdate}`);
  //replace the old show with the new one
  try {
    if (!(await show.get()).exists) {
      return {
        message: "show does not exist",
        status: 400,
      };
    }
    const data = await show.get();
    await newshow.set(data.data());
    await show.delete();
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

// create a func that gets show name and date and delete it from the database
const deleteShow = async (KenelClubName, date) => {
  const show = await db.collection("shows").doc(`${KenelClubName} - ${date}`);
  try {
    if (!(await show.get()).exists) {
      return {
        message: "show does not exist",
        status: 400,
      };
    }
    await show.delete();
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

const getallshows = async () => {
  //create an array to store the shows names
  const shows = [];
  //get all the shows from the database
  const showsdata = await db.collection("shows").get();
  //loop through the shows and push the show name to the array
  showsdata.forEach((show) => {
    shows.push(show.id);
  });
  //return the array
  return {
    shows: shows,
    message: "shows returned",
    status: 200,
  };
};

const authmanger = async (email, password) => {
  try {
    console.log(email, password);
    //create the user with the email and password
    const user = await auth.createUser({
      email: email,
      password: password,
    });
    console.log(user);
    //return the user
    return {
      user: user,
      message: "manger created",
      status: 200,
    };
  } catch (error) {
    return {
      error: error.message,
      status: 400,
    };
  }
};

const loginmanger = async (email, password) => {
  try {
    const user = await auth.signInWithEmailAndPassword({
      email: email,
      password: password,
    });
    //return the user
    return {
      user: user,
      message: "manger logged in",
      status: 200,
    };
  } catch (error) {
    return {
      error: error.message,
      status: 400,
    };
  }
};

const logoutmanger = async () => {
  try {
    await auth.unauth();
    return {
      message: "manger logged out",
      status: 200,
    };
  } catch (error) {
    return {
      message: "manger not logged in",
      status: 400,
    };
  }
};

const deleteManger = async (email, password) => {
  try {
    console.log(email, password);
    const user = await auth.signInWithEmailAndPassword({
      email: email,
      password: password,
    });
    console.log(user);
    await user.delete();
    return {
      message: "manger deleted",
      status: 200,
    };
  } catch (error) {
    return {
      error: error.message,
      status: 400,
    };
  }
};

module.exports = {
  createShow,
  updateshow,
  deleteShow,
  authmanger,
  loginmanger,
  getallshows,
  logoutmanger,
  deleteManger,
};
