// make the page not reload when submitting the form
import { getShows } from "./getShows.js";

document.addEventListener("DOMContentLoaded", function () {
  getShows();
});

document.getElementById("form").addEventListener("submit", (e) => {
  e.preventDefault();
  //save the selected option from the form
  var show = document.getElementById("show-list").value;
  console.log(show);

  //add the selected option to local storage
  localStorage.setItem("KenelClubName", show);
  //redirect to the next page
  window.location.href = "./dog-details.html";
});
