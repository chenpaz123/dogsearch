//get the list of shows from the database and display it on the page as a select list dont use node js for it
//create a function to get the list of shows from the database

import { getShows } from "./getshows.js";

document.addEventListener("DOMContentLoaded", function () {
  getShows();
});
document.getElementById("form").addEventListener("submit", (e) => {
  e.preventDefault();
  deleteShow();
});

const deleteShow = async () => {
  const show = document.getElementById("show-list").value;
  console.log(show);
  try {
    const response = await fetch(`http://localhost:3000/deleteshow`, {
      method: "DELETE",
      body: JSON.stringify({
        show,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    console.log(data);
    if (data["status"] == 200) {
      alert("התערוכה נמחקה בהצלחה");
      location.reload();
    }
  } catch (error) {
    console.log(error);
  }
};
