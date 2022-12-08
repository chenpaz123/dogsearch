// make the page not reload when submitting the form
document.getElementById("form").addEventListener("submit", (e) => {
  e.preventDefault();
  //save the selected option from the form
  var option = document.getElementById("selection").value;
  console.log(option);

  //add the selected option to local storage
  localStorage.setItem("KenelClubName", option);
  //redirect to the next page
  window.location.href = "./dog-details.html";
});
