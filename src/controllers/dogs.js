const { GetHisunValid } = require("../utils/hisunvalid");
const { getdatafrommoagdb } = require("../utils/getdatafrommoagdb");
const { db, rtdb } = require("../firebase/firebase");
const moment = require("moment");

const addDogToShow = async ({ ChipNum, Show }) => {
  //ShowDate = moment(Date.now()).format("DD.MM.YYYY");
  //ShowDate = "25.11.2022";
  const docname = `${Show}`;
  try {
    const data = await getdatafrommoagdb({ ChipNum });
    const dog = data["AnimalDetails"][0];
    HisunDate = data["AnimalDetails"][0]["HisunDate"];
    IsValid = GetHisunValid(HisunDate);
    console.log(IsValid);
    console.log(dog);

    //if the brucella field is exists in the chipnum document add the dog to the dogs collection inside the shows collection
    const docRef = db
      .collection("shows")
      .doc(docname)
      .collection("dogs")
      .doc(String(ChipNum));
    const doc = await docRef.get();
    //add dog to the dogs collection inside the shows collection
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

const getchipfromesp = async ({ chip }) => {
  //upload the chip number to the realtime database
  try {
    await rtdb.ref("chip").set(chip);
    return {
      message: "chip number uploaded",
      status: 201,
    };
  } catch (error) {
    console.log(error);
    return {
      message: "chip number not uploaded",
      status: 400,
    };
  }
};

module.exports = { addDogToShow, getchipfromesp };
