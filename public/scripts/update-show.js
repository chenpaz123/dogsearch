//get the list of shows from the database and display it on the page as a select list dont use node js for it
//create a function to get the list of shows from the database
import { getShows } from "./getshows.js";

document.addEventListener("DOMContentLoaded", function () {
  getShows();
});
document.getElementById("form").addEventListener("submit", (e) => {
  e.preventDefault();
  updateShow();
});

//create a function that take the new show name and date and send it to the server to update the database
const updateShow = async () => {
  const show = document.getElementById("show-list").value;
  console.log(show);
  const newkennelclub = document.getElementById("selection").value;
  const newdate = document.getElementById("newdate").value;
  console.log(newkennelclub);
  console.log(newdate);
  try {
    const response = await fetch(`http://localhost:3000/updateshow`, {
      method: "PATCH",
      body: JSON.stringify({
        show,
        newkennelclub,
        newdate,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    console.log(data);
    if (data["status"] == 200) {
      alert("התערוכה עודכנה בהצלחה");
      location.reload();
    }
  } catch (error) {
    console.log(error);
  }
};
