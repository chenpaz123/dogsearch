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
      localStorage.setItem("user", JSON.stringify(user.email));
      window.location.href = "manager-page.html";
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      switch (errorCode) {
        case "auth/wrong-password":
          showAlertModal("Wrong password.");
          break;
        case "auth/user-not-found":
          showAlertModal("User not found.");
          break;
        case "auth/invalid-email":
          showAlertModal("Invalid email.");
          break;
        case "auth/too-many-requests":
          showAlertModal("Too many requests.");
          break;
        case "auth/network-request-failed":
          showAlertModal("Network request failed.");
          break;
        case "auth/internal-error":
          showAlertModal("Internal error.");
          break;
        default:
          showAlertModal(
            `Login failed becuse of error: ${errorMessage} code: ${errorCode}`
          );
          break;
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
