import firebasejson from "./firebaseconfig.json" assert { type: "json" };
import { getAuth } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
//add firebase auth to the page

const firebaseConfig = firebasejson;
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

//create a function to login the manager with email and password

//do it with firebase auth
const login = async () => {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  try {
    const response = await auth.signInWithEmailAndPassword(email, password);
    console.log(response);
    if (response["status"] == 200) {
      alert("התחברת בהצלחה");
    }
  } catch (error) {
    console.log(error);
  }
};

//prevent the form from refreshing the page
const form = document.getElementById("login-form");
form.addEventListener("submit", (e) => {
  e.preventDefault();
});

//add an event listener to the login button
const loginButton = document.getElementById("login-button");
loginButton.addEventListener("click", login);
