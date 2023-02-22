//when pressing a button having the id of "button1" make post request to the server with the data from the input having the id of "chipnum" and print the response to the console in json format.
//

const vetfirstname = localStorage.getItem("vetfirstname");
const vetlastname = localStorage.getItem("vetlastname");

document.getElementById(
  "greeting"
).innerHTML += ` ${vetfirstname} ${vetlastname}`;
document.getElementById("button1").addEventListener("click", onFormSubmit);
function onFormSubmit() {
  event.preventDefault();
  CheckChip();
}

//if button 2 is pressed reload the page

//write the checkchip function in a way that it will work with the server
const CheckChip = async (chipnum) => {
  Clear();
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
};

const addDogToShow = async () => {
  const url = `http://localhost:3000/addDogToShow`;
  const Show = localStorage.getItem("KenelClubName");
  console.log(Show);
  try {
    console.log("in in try");
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        Show: Show,
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
  document.getElementById("chipnum").value = "";
};
//document.getElementById("button2").addEventListener("click", addDogToShow);
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
  console.log(data);
  if (data != 0) {
    CheckChip(data);
  }
  //change the value of the chip number in the database to 0
  setTimeout(200);
  set(ref(db, "chip/"), 0);
});
