import { loadFirebaseConfig } from "./firebase-config-loader.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js";

const showAlertModal = (message) => {
  const alertModal = document.getElementById("alertModal");
  const alertModalBody = document.getElementById("alertModalBody");
  alertModalBody.textContent = message;
  const bootstrapModal = new bootstrap.Modal(alertModal);
  bootstrapModal.show();
};

let authPromise;
const ensureAuth = async () => {
  if (!authPromise) {
    authPromise = (async () => {
      const firebaseConfig = await loadFirebaseConfig();
      const app = initializeApp(firebaseConfig);
      return getAuth(app);
    })().catch((error) => {
      console.error("Failed to initialise Firebase auth", error);
      showAlertModal("Unable to initialise authentication. Please try again later.");
      throw error;
    });
  }

  return authPromise;
};

const initialise = async () => {
  const auth = await ensureAuth();
  onAuthStateChanged(auth, (user) => {
    if (user) {
      window.location.href = "manager-dashboard.html";
    }
  });
};

const loginButton = document.getElementById("login-button");
loginButton.addEventListener("click", async (e) => {
  e.preventDefault();

  let auth;
  try {
    auth = await ensureAuth();
  } catch (error) {
    return;
  }

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password).catch((error) => {
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
          `Login failed because of error: ${errorMessage} code: ${errorCode}`
        );
        break;
    }
  });
});

initialise().catch((error) => {
  console.error("Failed to initialise login page", error);
});
