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
      if (shows == 0) {
        showList.innerHTML += "לא קיימות תערוכות";
      } else {
        console.log(show.name);
        console.log(show.date);
        //add the show in this format showname - showdate
        showList.innerHTML += `<option value="${show.name} - ${show.date}">${show.name} - ${show.date}</option>`;
      }
    });
  } catch (error) {
    console.log(error);
  }
};

export { getShows };
