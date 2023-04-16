const getShows = async () => {
  try {
    const response = await fetch("http://localhost:3000/getallshows");
    const data = await response.json();
    console.log(data);
    const shows = data.shows;
    console.log(shows);
    const showList = document.querySelector("tbody");
    showList.innerHTML = "";
    if (shows.length === 0) {
      showList.innerHTML = "<tr><td colspan='7'>No shows available</td></tr>";
    } else {
      shows.forEach((show) => {
        displayShow(show);
        setupEventListenersForShow(show);
      });
    }
  } catch (error) {
    console.log(error);
  }
};

window.addEventListener("DOMContentLoaded", () => {
  getShows();
});

const displayShow = (show) => {
  console.log(show);
  const showList = document.querySelector("tbody");
  console.log(showList);
  const showRow = document.createElement("tr");

  showRow.innerHTML = `
<th scope="row">${show.name}</th>
<td>${show.date}</td>
<td>${show.desc}</td>
<td>
<button
  type="button"
  class="btn btn-primary"
  data-bs-toggle="modal"
  data-bs-target="#updateShowModal"
  id="updateBtn-${show.name}"
>
  Update
</button>
</td>
<td>
<button
  type="button"
  class="btn btn-danger"
  data-bs-toggle="modal"
  data-bs-target="#deleteShowModal"
  id="deleteBtn-${show.name}"
>
  Delete
</button>
</td>
`;

  showList.appendChild(showRow);
};

const setupEventListenersForShow = (show) => {
  const deleteBtn = document.getElementById(`deleteBtn-${show.name}`);
  deleteBtn.addEventListener("click", () => {
    const deleteShowButtonsure = document.getElementById(
      "deleteShowButtonsure"
    );
    deleteShowButtonsure.onclick = null; // Reset the event handler
    deleteShowButtonsure.addEventListener(
      "click",
      async function deleteShowAndCloseModal() {
        await deleteShow(show);

        // Close the modal
        const deleteShowModalElement =
          document.getElementById("deleteShowModal");
        const deleteShowModal = bootstrap.Modal.getInstance(
          deleteShowModalElement
        );
        deleteShowModal.hide();

        // Remove the event listener
        deleteShowButtonsure.removeEventListener(
          "click",
          deleteShowAndCloseModal
        );
      }
    );
  });

  const updateBtn = document.getElementById(`updateBtn-${show.name}`);
  updateBtn.addEventListener("click", () => {
    const updateShowButton = document.getElementById("updateShowButton");
    updateShowButton.addEventListener("click", async () => {
      const oldshow = show;
      console.log(oldshow);
      const updatedShow = {
        name: document.getElementById("updateshowName").value,
        date: document.getElementById("updateshowDate").value,
        desc: document.getElementById("updateshowDescription").value,
      };
      console.log(updatedShow);
      await updateShow(oldshow, updatedShow);

      const updateShowModalElement = document.getElementById("updateShowModal");
      const updateShowModal = bootstrap.Modal.getInstance(
        updateShowModalElement
      );
      updateShowModal.hide();

      // Remove the event listener
      updateShowButton.removeEventListener("click", updateShowButton);
    });
  });
};
const updateShow = async (oldshow, updatedShow) => {
  try {
    const response = await fetch("http://localhost:3000/updateshow", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        oldshow: oldshow,
        updatedshow: updatedShow,
      }),
    });
    const data = await response.json();
    console.log(data);
    getShows();
  } catch (error) {
    console.log(error);
  }
};
const deleteShow = async (show) => {
  try {
    const response = await fetch("http://localhost:3000/deleteshow", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(show),
    });
    const data = await response.json();
    console.log(data);
    getShows();
  } catch (error) {
    console.log(error);
  }
};

// handle create show
const createShow = async (show) => {
  try {
    console.log("inside create show");
    console.log(show);
    const response = await fetch("http://localhost:3000/createshow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(show),
    });
    const data = await response.json();
    console.log(data);
    getShows();
  } catch (error) {
    console.log(error);
  }
};
//handle it with the button in the modal
const createShowButton = document.getElementById("createShowButton");
createShowButton.addEventListener(
  "click",
  async function createShowAndCloseModal() {
    const show = {
      showName: document.getElementById("createshowName111").value,
      date: document.getElementById("createshowDate").value,
      desc: document.getElementById("createshowDescription").value,
    };
    console.log("after click");
    console.log(show);
    await createShow(show);

    // Close the modal
    const createShowModalElement = document.getElementById("createShowModal");
    const createShowModal = bootstrap.Modal.getInstance(createShowModalElement);
    createShowModal.hide();
  }
);
window.addEventListener("DOMContentLoaded", () => {
  if (!localStorage.getItem("user")) {
    window.location.href = "manager-login.html";
  }
});

document.getElementById("logout").addEventListener("click", () => {
  localStorage.removeItem("user");
  window.location.href = "manager-login.html";
});
