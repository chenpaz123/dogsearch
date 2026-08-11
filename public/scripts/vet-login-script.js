const API_RESOURCE_ID = "14339de6-278c-49ed-a6c1-307044aaee3f";
const KEY_FIRST_NAME = "\u05E9\u05DD_\u05E4\u05E8\u05D8\u05D9";
const KEY_LAST_NAME = "\u05E9\u05DD_\u05DE\u05E9\u05E4\u05D7\u05D4";
const KEY_LICENSE_NUMBER = "\u05DE\u05E1\u05E4\u05E8_\u05E8\u05E9\u05D9\u05D5\u05DF";

document.addEventListener("DOMContentLoaded", () => {
  checkVetLoggedIn();

  document.getElementById("login-form").addEventListener("submit", (event) => {
    event.preventDefault();
    localStorage.removeItem("vetfirstname");
    localStorage.removeItem("vetlastname");
    validateCredentials();
  });
});

const buildLookupUrl = (license) =>
  `https://data.gov.il/api/3/action/datastore_search?resource_id=${API_RESOURCE_ID}&limit=5&q=${encodeURIComponent(
    license
  )}`;

const storeVetProfile = ({ firstName, lastName }) => {
  localStorage.setItem("vetfirstname", firstName);
  localStorage.setItem("vetlastname", lastName);
  localStorage.setItem("vetloggedin", "true");
};

const redirectToDogDetails = () => {
  window.location.href = "../pages/dog-details.html";
};

const getLicenseInput = () => document.getElementById("license-number");

const validateCredentials = async () => {
  const input = getLicenseInput();
  const licenseNumber = input.value.trim();

  if (!licenseNumber) {
    alert("Licence number is required");
    input.focus();
    return;
  }

  try {
    const response = await fetch(buildLookupUrl(licenseNumber));
    const payload = await response.json();
    const records = payload?.result?.records || [];

    if (records.length === 0) {
      throw new Error("No veterinarian record found");
    }

    const record = records[0];
    const firstName = record[KEY_FIRST_NAME] || "";
    const lastName = record[KEY_LAST_NAME] || "";
    const license = record[KEY_LICENSE_NUMBER] || "";

    if (String(license).trim() !== licenseNumber) {
      throw new Error("Licence number does not match registry entry");
    }

    storeVetProfile({ firstName, lastName });
    redirectToDogDetails();
  } catch (error) {
    console.error("Vet login failed", error);
    alert(error?.message || "Unable to verify licence number");
  }
};

const checkVetLoggedIn = () => {
  const vetLoggedIn = localStorage.getItem("vetloggedin");
  if (vetLoggedIn) {
    redirectToDogDetails();
  }
};
