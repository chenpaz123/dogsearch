//initialize firebase using ./firebase config.json file

// Initialize Firebase
import firebasejson from "./firebaseconfig.json" assert { type: "json" };
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js";

const firebaseConfig = firebasejson;
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const loginButton = document.getElementById("login-button");
loginButton.addEventListener("click", (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      console.log(userCredential);
      // Signed in
      const user = userCredential.user;
      console.log(user);
      alert(`Login successful, welcome ${user.email}`);
      localStorage.setItem("user", JSON.stringify(user.email));
      window.location.href = "manager-page.html";
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      switch (errorCode) {
        case "auth/wrong-password":
          alert("Wrong password.");
          break;
        case "auth/user-not-found":
          alert("User not found.");
          break;
        case "auth/invalid-email":
          alert("Invalid email.");
          break;
        default:
          `Login failed becuse of error: ${errorMessage} code: ${errorCode}`;
      }
    });
});

const checkloggedin = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user) {
    window.location.href = "manager-page.html";
  }
};

checkloggedin();

//write the login as function in try catch and call it in the event listener
/*
loginButton.addEventListener("click", (e) => {
  e.preventDefault();
  try {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    login(email, password);
  } catch (error) {
    console.log(error);
  }
});*/
