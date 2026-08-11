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

    onValue(ref(db, "chip/"), async (snapshot) => {
      const data = snapshot.val();
      if (data !== 0) {
        Clear();
        getdatafrommoagdb(data);
      }
      //change the value of the chip number in the database to 0
      try {
        await set(ref(db, "chip/"), 0);
      } catch (error) {
        console.error("Failed to set the value to 0:", error);
      }
    });
  } catch (error) {
    console.error("Error initializing Firebase:", error);
  }
};

initFirebase();

const demoDB = (chip) => {
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

  for (let i = 0; i < response["Count"]; i++) {
    if (response["AnimalDetails"][i]["ChipNumber"] === String(chip)) {
      return response;
    } else {
      return null;
    }
  }
};

const getdatafrommoagdb = (ChipNum) => {
  const data = demoDB(ChipNum);
  if (data !== null) {
    addDogToShow(data);
  } else {
    showAlertModal("הכלב לא נמצא במאגר");
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

    if (data.dog) {
      PrintData(data);
    }

    switch (data.status) {
      case 200:
        showAlertModal("הכלב רשאי להיכנס לתערוכה");
        break;
      case 409:
        showAlertModal("לא נמצאה בדיקת ברוצלה לכלב זה בתערוכה");
        break;
      case 422:
        showAlertModal("חיסון הכלבת אינו בתוקף");
        break;
      case 404:
        showAlertModal("מספר השבב שהזנת אינו קיים במערכת");
        break;
      case 503:
        showAlertModal("אין חיבור למאגר משרד החקלאות, נסה שוב בעוד מספר שניות");
        break;
      default:
        showAlertModal(data.message || "אירעה שגיאה, נסה שוב");
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
