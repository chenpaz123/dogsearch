document.addEventListener("DOMContentLoaded", () => {
  checkVetLoggedIn();

  document.getElementById("login-form").addEventListener("submit", (event) => {
    event.preventDefault();
    localStorage.removeItem("vetfirstname");
    localStorage.removeItem("vetlastname");
    validateCredentials();
  });
});

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
    const response = await fetch("/vetlogin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ licenseNumber }),
    });
    const payload = await response.json();

    if (!response.ok) {
      throw new Error(payload?.message || "Unable to verify licence number");
    }

    storeVetProfile({
      firstName: payload.vetFirstName || "",
      lastName: payload.vetLastName || "",
    });
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
