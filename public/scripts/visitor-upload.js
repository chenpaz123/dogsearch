import { getShows } from "./get-shows.js";
import { getApiBase } from "./firebase-config-loader.js";

const API_BASE = getApiBase();

const showSpinnerModal = () => {
  const loadingModal = document.getElementById("loading-modal");
  const loadingMessage = document.getElementById("loadingMessage");
  const circle = document.getElementById("circle");
  const closeButton = document.getElementById("closeButton");
  loadingMessage.textContent =
    "The system is scanning your files, this can take up to a minute";
  circle.style.display = "block";
  closeButton.style.display = "none";
  loadingModal.classList.add("show");
  loadingModal.style.display = "block";
};

const showLoadingModal = (message) => {
  const loadingModal = document.getElementById("loading-modal");
  const loadingMessage = document.getElementById("loadingMessage");
  const circle = document.getElementById("circle");
  const closeButton = document.getElementById("closeButton");
  loadingMessage.textContent = message || "";
  circle.style.display = "none";
  closeButton.style.display = "block";
  loadingModal.classList.add("show");
  loadingModal.style.display = "block";
};

const hideLoadingModal = () => {
  const loadingModal = document.getElementById("loading-modal");
  loadingModal.classList.remove("show");
  loadingModal.style.display = "none";
};

const formatDate = (value) => {
  if (!value) {
    return "";
  }
  const [year, month, day] = value.split("-");
  if (!year || !month || !day) {
    return "";
  }
  return `${day}/${month}/${year}`;
};

const extractDate = (value) => {
  if (!value) {
    return "";
  }
  const parts = value.split("-");
  return parts.length > 1 ? parts[1].trim() : value.trim();
};

const getImageUrl = async (image) => {
  const fd = new FormData();
  fd.append("image", image);
  const response = await fetch(`${API_BASE}/upload/image`, {
    method: "POST",
    body: fd,
  });
  const data = await response.json();
  if (!response.ok || data.status !== 201) {
    throw new Error(data.message || "Image upload failed.");
  }
  return data.path;
};

/**
 * Sends visitor data to the server for verification.
 *
 * @param {string} show - The selected show ID.
 * @param {string} chipnum - The dog's chip number.
 * @param {string} brucelladate - The Brucella test date.
 * @param {string} image - The URL of the uploaded image.
 */
const sendData = async (show, chipnum, brucelladate, image) => {
  const showdate = extractDate(show);

  const response = await fetch(`${API_BASE}/visitordata`, {
    method: "POST",
    body: JSON.stringify({
      showdate,
      image,
      chipnum,
      show, // Send show ID
      brucelladate, // Send manual date as fallback
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });

  const data = await response.json();

  // Handle validation errors (400 with errors array)
  if (data.status === 400 && data.errors && data.errors.length > 0) {
    hideLoadingModal();
    const errorMessage = data.errors.join("\\n");
    showLoadingModal(`Validation Error:\\n${errorMessage}`);
    return;
  }

  switch (data.status) {
    case 201: {
      // Success - data is already saved by the server
      hideLoadingModal();
      showLoadingModal("Brucella added successfully.");
      break;
    }

    case 400:
      hideLoadingModal();
      showLoadingModal(data.message || "Invalid request.");
      break;
    case 401:
      hideLoadingModal();
      showLoadingModal("Chip number missing.");
      break;
    case 402:
      hideLoadingModal();
      showLoadingModal("Brucella not valid.");
      break;
    case 403:
      hideLoadingModal();
      showLoadingModal(data.message || "Missing Brucella date.");
      break;
    case 405:
      hideLoadingModal();
      showLoadingModal("No image uploaded.");
      break;
    case 406:
      hideLoadingModal();
      showLoadingModal(data.message || "Chip number mismatch.");
      break;
    case 422:
      hideLoadingModal();
      showLoadingModal("Brucella result not negative.");
      break;
    case 423:
      hideLoadingModal();
      showLoadingModal("Could not determine Brucella result.");
      break;
    case 409:
      hideLoadingModal();
      showLoadingModal("Dog already registered.");
      break;
    default:
      hideLoadingModal();
      showLoadingModal(data.message || "General Brucella processing error.");
      break;
  }
};

const initialiseForm = () => {
  const submitButton = document.getElementById("button1");
  const form = document.getElementById("form");
  const closeButton = document.getElementById("closeButton");

  const onFormSubmit = async (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    const show = document.getElementById("show-list").value;
    const chipnum = document.getElementById("chipnum").value.trim();
    const brucelladate = formatDate(
      document.getElementById("brucelladate").value
    );
    const file = document.getElementById("file").files[0];

    if (!file) {
      showLoadingModal("Please choose an image before uploading.");
      return;
    }

    showSpinnerModal();
    submitButton?.setAttribute("disabled", "disabled");

    try {
      const fileUrl = await getImageUrl(file);
      await sendData(show, chipnum, brucelladate, fileUrl);
    } catch (error) {
      showLoadingModal(error?.message || "Request failed. Please try again.");
    } finally {
      submitButton?.removeAttribute("disabled");
    }
  };

  submitButton?.addEventListener("click", onFormSubmit);
  form?.addEventListener("submit", onFormSubmit);
  closeButton?.addEventListener("click", hideLoadingModal);
};

document.addEventListener("DOMContentLoaded", () => {
  getShows();
  initialiseForm();
});
