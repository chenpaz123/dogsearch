/**
 * The getShows function fetches a list of shows from the server, and populates
 * the show list dropdown in the HTML with the retrieved show information.
 *
 * @returns {Promise<void>} A Promise that resolves when the operation is complete.
 * @throws {Error} Throws an error if an issue occurs during the fetch operation.
 */
const getShows = async () => {
  try {
    // Fetch the show data from the server
    const response = await fetch("http://localhost:3000/getallshows");
    const data = await response.json();
    console.log(data);
    const shows = data.shows;
    console.log(shows);

    // Select the show list element in the HTML
    const showList = document.querySelector("#show-list");
    showList.innerHTML = "";

    // Check if there are any shows in the retrieved data
    if (shows.length === 0) {
      // If there are no shows, display a message indicating that no shows are available
      showList.innerHTML =
        "<option disabled selected>לא קיימות תערוכות</option>";
    } else {
      // If there are shows, populate the dropdown with the show information
      shows.forEach((show) => {
        console.log(show.name);
        console.log(show.date);
        // Add the show in this format: showname - showdate
        showList.innerHTML += `<option value="${show.name} - ${show.date}">${show.name} - ${show.date}</option>`;
      });
    }
  } catch (error) {
    // Log any errors that occur during the fetch operation
    console.log(error);
  }
};

export { getShows };
