import { getApiBase } from "./firebase-config-loader.js";

const getShows = async () => {
  const showList = document.getElementById("show-list");
  if (!showList) return;

  try {
    const response = await fetch(`${getApiBase()}/getshows`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const shows = data.shows || [];

    if (shows.length === 0) {
      showList.innerHTML =
        "<option disabled selected>לא נמצאו תערוכות</option>";
      return;
    }

    showList.innerHTML =
      "<option disabled selected>בחר תערוכה</option>";

    shows.forEach((show) => {
      showList.innerHTML += `<option value="${show.name} - ${show.date}">${show.name} - ${show.date}</option>`;
    });
  } catch (error) {
    console.error("Failed to load shows", error);
    showList.innerHTML =
      "<option disabled selected>שגיאה בטעינת תערוכות</option>";
  }
};

export { getShows };
