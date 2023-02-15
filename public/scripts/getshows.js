const getShows = async () => {
  try {
    const response = await fetch("http://localhost:3000/getallshows");
    const data = await response.json();
    console.log(data);
    const shows = data.shows;
    console.log(shows);
    const showList = document.querySelector("#show-list");
    showList.innerHTML = "";
    shows.forEach((show) => {
      if (shows.length == 0) {
        showList.innerHTML += "לא קיימות תערוכות";
      } else {
        showList.innerHTML += `<option value="${show}">${show}</option>`;
      }
    });
  } catch (error) {
    console.log(error);
  }
};

export { getShows };
