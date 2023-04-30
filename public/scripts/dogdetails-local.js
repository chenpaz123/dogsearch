//vet section

const vetfirstname = localStorage.getItem("vetfirstname");
const vetlastname = localStorage.getItem("vetlastname");

document.getElementById(
  "greeting"
).innerHTML += ` ${vetfirstname} ${vetlastname}`;

import { getShows } from "./getshows.js";
document.addEventListener("DOMContentLoaded", function () {
  getShows();
});
document.addEventListener("DOMContentLoaded", () => {
  const scandog = document.getElementById("scan dog");
  scandog.style.display = "none";
  const form = document.getElementById("form");
  const showList = document.getElementById("show-list");
  checkshow();
  checkvetloggedin();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    console.log(showList.value);
    if (showList.value == "לא קיימות תערוכות") {
      alert("לא קיימות תערוכות");
    } else {
      if (showList.value != "Select a Show") {
        localStorage.setItem("showname", showList.value);
        const chooseshow = document.getElementById("chooseshow");
        chooseshow.style.display = "none";
        const scandog = document.getElementById("scan dog");
        scandog.style.display = "block";
      } else {
        alert("בחר תערוכה");
      }
    }
  });
});

const checkshow = () => {
  const showname = localStorage.getItem("showname");
  if (showname) {
    const chooseshow = document.getElementById("chooseshow");
    const scandog = document.getElementById("scan dog");

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
console.log(db);

onValue(ref(db, "chip/"), async (snapshot) => {
  console.log(snapshot.val());
  console.log("in on value");
  const data = snapshot.val();
  console.log("chip number" + data);
  console.log("written chip" + data);
  if (data != 0) {
    Clear();
    getdatafrommoagdb(data);
  }
  //change the value of the chip number in the database to 0
  try {
    await set(ref(db, "chip/"), 0);
    console.log("Value set to 0 successfully.");
  } catch (error) {
    console.error("Failed to set the value to 0:", error);
  }
});

const response = {
  Count: 1,
  Date: "04/30/2023 14:59:24",
  AnimalDetails: [
    {
      AnimalType: "כלב",
      ChipNumber: "939000007508553",
      AnimalName: "פארוק",
      Gender: "זכר",
      Race: "פודל",
      Color: "שחור",
      BrithDate: "02/2011",
      DangerousDog: false,
      GuidingDog: false,
      SecurityDog: false,
      OwnerName: "פז איריס ואמיר",
      Address: "ביאליק 162/46",
      City: "חולון",
      CellPhone: "052-4244342",
      Yikur: true,
      Hisun: "13",
      HisunDate: "10/04/2023",
      VetName: "היימן גיורא דב",
      Vetnumber: "669",
      LicenceNumber: "2335",
      LicenceDate: "01/02/2011",
      LastUpdate: "23/04/2023",
      Status: "פעיל",
      Brucella: false,
      MdBAddress: " ",
    },
  ],
};

const getdatafrommoagdb = (ChipNum) => {
  console.log("in bewwwww");
  const data = response;
  if ((ChipNum = data["AnimalDetails"][0]["ChipNumber"])) {
    console.log("chip number is the same");
    console.log(ChipNum);
    addDogToShow(data);
  } else {
    console.log("chip number is not the same");
    alert("מספר השבב שהזנת אינו קיים במערכת");
    console.log(ChipNum);
  }
};

const addDogToShow = async (chipdata) => {
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
      }),
    });
    console.log("after fetch");
    console.log(response);
    const data = await response.json();
    console.log("after response");
    console.log(data);

    switch (data.status) {
      case 201:
        PrintData(data);
        alert("הכלב רשאי להיכנס לתערוכה");
        break;
      case 400:
        PrintData(data);
        alert("הכלב אינו רשאי להיכנס לתערוכה");
        break;
      case 500:
        alert("אין חיבור לאינטרנט");
        break;
      case 404:
        alert("מספר השבב שהזנת אינו קיים במערכת");
        break;
    }
  } catch (error) {
    console.log(error);
  }
};

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
    document.getElementById("brucelladate").style.color = "red";
    document.getElementById("brucelladate").style.fontWeight = "bold";
    document.getElementById("brucelladate").style.fontSize = "30px";
  }

  if (data["KalevetValid"]) {
    document.getElementById("kalevetvalid").style.color = "green";
    document.getElementById("kalevetvalid").innerHTML = "בתוקף";
    document.getElementById("kalevetvalid").style.fontWeight = "bold";
    document.getElementById("kalevetvalid").style.fontSize = "30px";
  } else {
    document.getElementById("kalevetvalid").style.color = "red";
    document.getElementById("kalevetvalid").innerHTML = "לא בתוקף";
    document.getElementById("kalevetvalid").style.fontWeight = "bold";
    document.getElementById("kalevetvalid").style.fontSize = "30px";
  }
  if (data["BrucellaValid"]) {
    document.getElementById("brucellavalid").style.color = "green";
    document.getElementById("brucellavalid").innerHTML = "בתוקף";
    document.getElementById("brucellavalid").style.fontWeight = "bold";
    document.getElementById("brucellavalid").style.fontSize = "30px";
  } else {
    document.getElementById("brucellavalid").style.color = "red";
    document.getElementById("brucellavalid").innerHTML = "לא בתוקף";
    document.getElementById("brucellavalid").style.fontWeight = "bold";
    document.getElementById("brucellavalid").style.fontSize = "30px";
  }
};
