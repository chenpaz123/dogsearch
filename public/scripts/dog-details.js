//vet section

const vetfirstname = localStorage.getItem("vetfirstname");
const vetlastname = localStorage.getItem("vetlastname");

document.getElementById(
  "greeting"
).innerHTML += ` ${vetfirstname} ${vetlastname}`;

import { getShows } from "./get-shows.js";
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
    if (showList.value === "לא קיימות תערוכות") {
      showAlertModal("לא קיימות תערוכות");
    } else {
      if (showList.value !== "Select a Show") {
        localStorage.setItem("showname", showList.value);
        const chooseshow = document.getElementById("chooseshow");
        chooseshow.style.display = "none";
        const scandog = document.getElementById("scan dog");
        scandog.style.display = "block";
      } else {
        showAlertModal("בחר תערוכה");
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

import { loadFirebaseConfig } from "./firebase-config-loader.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-app.js";
import {
  getDatabase,
  ref,
  set,
  onValue,
} from "https://www.gstatic.com/firebasejs/9.14.0/firebase-database.js";

import { getAuth, signInWithCustomToken } from "https://www.gstatic.com/firebasejs/9.14.0/firebase-auth.js";
import { getApiBase } from "./firebase-config-loader.js";

const initFirebase = async () => {
  try {
    const firebaseConfig = await loadFirebaseConfig();
    const app = initializeApp(firebaseConfig);
    
    const auth = getAuth(app);
    
    // Fetch custom token from backend
    const apiBase = getApiBase();
    const response = await fetch(`${apiBase}/auth/token`);
    if (!response.ok) throw new Error("Failed to fetch custom token");
    
    const { token } = await response.json();
    await signInWithCustomToken(auth, token);
    console.log("Signed in with custom token");

    const db = getDatabase(app);
    const chipRef = ref(db, "chip/");

    onValue(chipRef, async (snapshot) => {
      const data = snapshot.val();
      if (data !== 0) {
        Clear();
        await getdatafrommoagdb(data);
      }
      //change the value of the chip number in the database to 0
      try {
        if (data !== 0) {
             await set(chipRef, 0);
        }
      } catch (error) {
        console.error("Failed to set the value to 0:", error);
      }
    }, (error) => {
        console.error("RTDB Listener Error:", error);
    });
  } catch (error) {
    console.error("Error initializing Firebase:", error);
  }
};

initFirebase();

/**
 * Fetches dog details from the MOAG (Ministry of Agriculture) database.
 * 
 * @param {string} ChipNum - The dog's chip number.
 */
const getdatafrommoagdb = async (ChipNum) => {
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
    await addDogToShow(data);
  } catch (error) {
    console.error(error);
  }
};

const addDogToShow = async (chipdata) => {
  if (chipdata["Count"] === 0) {
    showAlertModal("המאגר לא זמין כעת, נסה שוב בעוד מספר שניות");
    return;
  }

  const url = `http://localhost:3000/addDogToShow`;
  const Show = localStorage.getItem("showname");
  document.getElementById("scan dog").style.display = "none";
  try {
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
    const data = await response.json();

    switch (data.status) {
      case 201:
        PrintData(data);
        showAlertModal("הכלב רשאי להיכנס לתערוכה");
        break;
      case 400:
        PrintData(data);
        showAlertModal("הכלב אינו רשאי להיכנס לתערוכה");
        break;
      case 500:
        showAlertModal("אין חיבור לאינטרנט");
        break;
      case 404:
        showAlertModal("מספר השבב שהזנת אינו קיים במערכת");
        break;
    }
  } catch (error) {
    console.error(error);
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

  if (data["brucelladate"] === undefined) {
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

const showAlertModal = (message) => {
  // Select the modal element using its ID 'alertModal'.
  const alertModal = document.getElementById("alertModal");

  // Select the modal body element using its ID 'alertModalBody'.
  const alertModalBody = document.getElementById("alertModalBody");

  // Update the text content of the modal body with the provided message.
  alertModalBody.textContent = message;

  // Show the modal using Bootstrap's 'modal' method with the 'show' argument.
  const bootstrapModal = new bootstrap.Modal(alertModal);
  bootstrapModal.show();
};
