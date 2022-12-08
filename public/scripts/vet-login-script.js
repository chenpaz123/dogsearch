//if the password is correct, the user is logged in and moved to the dog details page
//if the password is incorrect, the user is alerted and the page is reloaded
/*function checkPassword() {
    var password = document.getElementById("password").value;
    if (password == "password") {
        window.location.href = "dog-details.html";
    } else {
        alert("Incorrect password");
        window.location.reload();
    }
}*/

//initiate checkPassword function when the form is submitted
document
  .getElementById("login-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    localStorage.clear();
    checkPassword();
  });
var modal = document.getElementById("myModal");

// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

//check if the password is in the database using the API with the https://data.gov.il/api/3/action/datastore_search?resource_id=14339de6-278c-49ed-a6c1-307044aaee3f&limit=5&q= password parameter
//if the password is correct, the user is logged in and moved to the dog details page
//if the password is incorrect, the user is alerted and the page is reloaded
// rewrite the code to use async/await

var tempvetfirstname = "null";
var tempvetlastname = "null";

const checkPassword = async () => {
  var password = document.getElementById("license number").value;
  const url = `https://data.gov.il/api/3/action/datastore_search?resource_id=14339de6-278c-49ed-a6c1-307044aaee3f&limit=5&q=${password}`;
  console.log(url);
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log(data);
    console.log(data.result.records[0]);
    const newdata = data.result.records[0];
    console.log(newdata);
    const {
      שם_פרטי: vetfirstname,
      שם_משפחה: vetlastname,
      מספר_רשיון: licensenumber,
    } = newdata;

    //save the vet's name in the local storage
    localStorage.setItem("vetfirstname", vetfirstname);
    localStorage.setItem("vetlastname", vetlastname);

    console.log(vetfirstname);
    console.log(vetlastname);
    console.log(licensenumber);
    tempvetfirstname = vetfirstname;
    tempvetlastname = vetlastname;
    if (licensenumber == password) {
      window.location.href = "../pages/options-page.html";
    }
  } catch (error) {
    console.log(error);
    modal.style.display = "block";
  }
};

// When the user clicks on <span> (x), close the modal
span.onclick = function () {
  window.location.reload();
};

window.onclick = function (event) {
  if (event.target == modal) {
    window.location.reload();
  }
};

//export vet name and license number to script.js
