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

document.addEventListener("DOMContentLoaded", function () {
  checkvetloggedin();
});
//initiate checkPassword function when the form is submitted
document
  .getElementById("login-form")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    localStorage.removeItem("vetfirstname");
    localStorage.removeItem("vetlastname");
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
    if (data.result.records.length == 0) {
      throw new Error("משתמש לא קיים");
    }
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
    localStorage.setItem("vetloggedin", true);

    console.log(vetfirstname);
    console.log(vetlastname);
    console.log(licensenumber);
    tempvetfirstname = vetfirstname;
    tempvetlastname = vetlastname;
    if (licensenumber == password) {
      window.location.href = "../pages/dog-details.html";
    }
  } catch (error) {
    console.log(error);
    alert(error);
  }
};

//check vet logged in
const checkvetloggedin = () => {
  const vetloggedin = localStorage.getItem("vetloggedin");
  if (vetloggedin) {
    window.location.href = "../pages/dog-details.html";
  }
};
