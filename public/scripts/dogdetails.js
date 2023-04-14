//when pressing a button having the id of "button1" make post request to the server with the data from the input having the id of "chipnum" and print the response to the console in json format.
//

//vet section

const vetfirstname = localStorage.getItem("vetfirstname");
const vetlastname = localStorage.getItem("vetlastname");

document.getElementById(
  "greeting"
).innerHTML += ` ${vetfirstname} ${vetlastname}`;
/*function onFormSubmit() {
  event.preventDefault();
  CheckChip();
}*/

//if button 2 is pressed reload the page
document.getElementById("button2").addEventListener("click", () => {
  location.reload();
});

import { getShows } from "./getshows.js";
document.addEventListener("DOMContentLoaded", function () {
  getShows();
});
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("form");
  const showList = document.getElementById("show-list");
  checkshow();
  checkvetloggedin();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    console.log(showList.value);
    if (showList.value != "Select a Show") {
      localStorage.setItem("showname", showList.value);
      const chooseshow = document.getElementById("chooseshow");
      chooseshow.style.display = "none";
      scandog.style.display = "block";
    } else {
      alert("בחר תערוכה");
    }
  });
});
const scandog = document.getElementById("scan dog");
scandog.style.display = "none";
const checkshow = () => {
  const showname = localStorage.getItem("showname");
  if (showname) {
    const chooseshow = document.getElementById("chooseshow");
    chooseshow.style.display = "none";
    scandog.style.display = "block";
  }
};

const checkvetloggedin = () => {
  const vetloggedin = localStorage.getItem("vetloggedin");
  if (!vetloggedin) {
    window.location.href = "vet-interface.html";
  }
};
const logoutbtn = document.getElementById("logoutbtn");
logoutbtn.addEventListener("click", () => {
  localStorage.removeItem("vetloggedin");
  localStorage.removeItem("showname");
  localStorage.removeItem("vetfirstname");
  localStorage.removeItem("vetlastname");
  window.location.href = "vet-interface.html";
});

//chip section

import firebasejson from "./firebaseconfig.json" assert { type: "json" };
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  onValue,
} from "https://www.gstatic.com/firebasejs/9.14.0/firebase-database.js";

const firebaseConfig = firebasejson;
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

//on firebase change event activate a function

onValue(ref(db, "chip/"), (snapshot) => {
  const data = snapshot.val();
  console.log("written chip" + data);
  if (data != 0) {
    //CheckChip(data);
    //data = parseInt(data);
    Clear();
    getdatafrommoagdb(data);
  }
  //change the value of the chip number in the database to 0
  setTimeout(200);
  set(ref(db, "chip/"), 0);
});

//write the checkchip function in a way that it will work with the server
/*
const CheckChip = async (chipnum) => {
  //var chipnum = document.getElementById("chipnum").value;
  var url = `http://localhost:3000/GetChipNumFromESP/${chipnum}`;
  var senddata = { ChipNum: parseInt(chipnum) };
  console.log(senddata);
  console.log(JSON.stringify(senddata));
  try {
    //allow the server to read the data from the request
    // allow the request to be sent to the server
    //allow the server to send the response to the client
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log(response);
    addDogToShow();
  } catch (error) {
    console.log(error);
    alert("אין חיבור לשרת");
  }
};*/

//// fetch to this address https://dogsearch.moag.gov.il/api/GetAnimalDetails with the body {"SearchParam":"939000011003017","top":10,"skip":0}
const getdatafrommoagdb = async (ChipNum) => {
  console.log(ChipNum);
  console.log("in find with " + ChipNum);
  const url = "https://dogsearch.moag.gov.il/api/GetAnimalDetails";
  const senddata = { SearchParam: ChipNum, top: 10, skip: 0 };
  try {
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(senddata),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    console.log(data);
    await addDogToShow(data);
  } catch (error) {
    console.log(error);
  }
};

const addDogToShow = async (
  //chipnum,
  chipdata
) => {
  if (chipdata["Count"] == 0) {
    alert("המאגר לא זמין כעת, נסה שוב בעוד מספר שניות");
    return;
  }
  console.log(chipdata);

  const url = `http://localhost:3000/addDogToShow`;
  const Show = localStorage.getItem("showname");
  console.log(Show);
  document.getElementById("scan dog").style.display = "none";
  try {
    console.log("in in try");
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Show: Show,
        data: chipdata,
        //chioNum: chipnum,
      }),
    });
    console.log("after fetch");
    console.log(response);
    const data = await response.json();
    console.log("after response");
    console.log(data);
    if (data.status == 201) {
      PrintData(data);
      alert("הכלב רשאי להיכנס לתערוכה");
    }
    if (data.status == 400) {
      PrintData(data);
      alert("הכלב אינו רשאי להיכנס לתערוכה");
    }
    if (data.status == 500) {
      alert("אין חיבור לאינטרנט");
    }
    if (data.status == 404) {
      alert("מספר השבב שהזנת אינו קיים במערכת");
    }
  } catch (error) {
    console.log(error);
  }
};

//getdatafrommoagdb(939000011003017);

//page section

const Clear = () =>
  //clear the data from the previous search
  {
    document.getElementById("hisundate").innerHTML = "";
    document.getElementById("chip").innerHTML = "";
    document.getElementById("name").innerHTML = "";
    document.getElementById("breed").innerHTML = "";
    document.getElementById("color").innerHTML = "";
    document.getElementById("brucelladate").innerHTML = "";
    document.getElementById("kalevetvalid").innerHTML = "";
    document.getElementById("brucellavalid").innerHTML = "";
  };

const PrintData = (data) => {
  //print the data from the server to the html page

  const hisundate = data["dog"]["HisunDate"];
  const chipnumber = data["dog"]["ChipNumber"];

  document.getElementById("hisundate").innerHTML = hisundate;
  document.getElementById("brucelladate").innerHTML = data["brucelladate"];
  document.getElementById("chip").innerHTML = chipnumber;
  document.getElementById("name").innerHTML = data["dog"]["AnimalName"];
  document.getElementById("breed").innerHTML = data["dog"]["Race"];
  document.getElementById("color").innerHTML = data["dog"]["Color"];
  document.getElementById("kalevetvalid").innerHTML = data["KalevetValid"];
  document.getElementById("brucellavalid").innerHTML = data["BrucellaValid"];

  if (data["brucelladate"] == undefined) {
    document.getElementById("brucelladate").innerHTML = "לא נמצא";
    document.getElementById("brucellavalid").style.color = "red";
  }

  if (data["KalevetValid"]) {
    document.getElementById("kalevetvalid").style.color = "green";
    document.getElementById("kalevetvalid").innerHTML = "בתוקף";
  } else {
    document.getElementById("kalevetvalid").style.color = "red";
    document.getElementById("kalevetvalid").innerHTML = "לא בתוקף";
  }
  if (data["BrucellaValid"]) {
    document.getElementById("brucellavalid").style.color = "green";
    document.getElementById("brucellavalid").innerHTML = "בתוקף";
  } else {
    document.getElementById("brucellavalid").style.color = "red";
    document.getElementById("brucellavalid").innerHTML = "לא בתוקף";
  }
};
//document.getElementById("button2").addEventListener("click", addDogToShow);
