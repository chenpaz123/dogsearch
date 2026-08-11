import { loadFirebaseConfig, getApiBase } from "./firebase-config-loader.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.19.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.19.1/firebase-auth.js";

let authPromise;
let apiBase;

const ensureAuth = async () => {
  if (!authPromise) {
    authPromise = (async () => {
      const config = await loadFirebaseConfig();
      const app = initializeApp(config);
      apiBase = getApiBase();
      return getAuth(app);
    })();
  }
  return authPromise;
};

const authorisedFetch = async (path, options = {}) => {
  const auth = await ensureAuth();
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User is not authenticated");
  }
  const token = await user.getIdToken();
  const headers = {
    ...(options.headers || {}),
    Authorization: `Bearer ${token}`,
  };
  return fetch(`${apiBase}${path}`, { ...options, headers });
};

const renderShows = (shows, append = false) => {
  const showList = document.querySelector("tbody");
  
  if (!append) {
    showList.innerHTML = "";
  }
  
  if (!shows || shows.length === 0) {
    if (!append) {
      showList.innerHTML = "<tr><td colspan='7'>No shows available</td></tr>";
    }
    return;
  }

  shows.forEach((show) => {
    const showRow = document.createElement("tr");
    showRow.innerHTML = `
      <th scope="row">${show.name}</th>
      <td>${show.date}</td>
      <td>${show.desc}</td>
      <td>${show.dogCount || 0}</td>
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
      </td>`;

    document.querySelector("tbody").appendChild(showRow);
    setupEventListenersForShow(show);
  });
};

let currentOffset = 0;
const LIMIT = 50;

const getShows = async (append = false) => {
  try {
    const response = await authorisedFetch(`/getallshows?limit=${LIMIT}&offset=${currentOffset}`);
    
    if (!response.ok) {
      const data = await response.json();
      console.error("Failed to load shows:", data);
      
      // Handle validation errors
      if (data.errors && data.errors.length > 0) {
        alert(`Validation Error:\n${data.errors.join("\n")}`);
      } else {
        alert(data.message || "Failed to load shows");
      }
      return;
    }
    
    const data = await response.json();
    
    if (append) {
      const existingShows = Array.from(document.querySelectorAll("tbody tr")).map((row) => ({
        name: row.querySelector("th").textContent,
      }));
      const newShows = (data.shows || []).filter(
        (show) => !existingShows.some((existing) => existing.name === show.name)
      );
      renderShows(newShows, true);
    } else {
      renderShows(data.shows || [], false);
    }
    
    // Update pagination controls
    updatePaginationControls(data);
    
  } catch (error) {
    console.error("Failed to load shows", error);
    alert("Failed to load shows. Please try again.");
  }
};

const updatePaginationControls = (data) => {
  // Safety checks
  if (!data) {
    console.warn("updatePaginationControls called with no data");
    return;
  }
  
  let paginationDiv = document.getElementById("pagination-controls");
  
  if (!paginationDiv) {
    const tableContainer = document.querySelector("tbody")?.parentElement?.parentElement;
    if (!tableContainer) {
      console.error("Cannot find table container for pagination");
      return;
    }
    
    paginationDiv = document.createElement("div");
    paginationDiv.id = "pagination-controls";
    paginationDiv.className = "mt-3 text-center";
    tableContainer.appendChild(paginationDiv);
  }
  
  const hasMore = data.hasMore || false;
  const total = data.total || 0;
  const showsLength = (data.shows || []).length;
  const currentCount = currentOffset + showsLength;
  
  if (hasMore) {
    paginationDiv.innerHTML = `
      <button id="loadMoreBtn" class="btn btn-secondary">
        Load More (showing ${currentCount} of ${total})
      </button>
    `;
    
    const loadMoreBtn = document.getElementById("loadMoreBtn");
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener("click", () => {
        currentOffset += LIMIT;
        getShows(true);
      });
    }
  } else {
    paginationDiv.innerHTML = `
      <p class="text-muted">
        Showing all ${total} show${total !== 1 ? 's' : ''}
      </p>
    `;
  }
};

const updateShow = async (oldshow, updatedShow) => {
  try {
    const response = await authorisedFetch("/updateShow", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        oldshow: {
          name: oldshow.name,
          date: oldshow.date,
        },
        updatedshow: updatedShow,
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      const errorMsg = data.errors ? data.errors.join("\n") : data.message || "Failed to update show";
      alert(`Error: ${errorMsg}`);
      return;
    }
    
    currentOffset = 0; // Reset pagination
    getShows();
  } catch (error) {
    console.error("Failed to update show", error);
    alert("Failed to update show. Please try again.");
  }
};

const deleteShow = async (show) => {
  try {
    const response = await authorisedFetch("/deleteShow", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: show.name,
        date: show.date,
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      const errorMsg = data.errors ? data.errors.join("\n") : data.message || "Failed to delete show";
      alert(`Error: ${errorMsg}`);
      return;
    }
    
    currentOffset = 0; // Reset pagination
    getShows();
  } catch (error) {
    console.error("Failed to delete show", error);
    alert("Failed to delete show. Please try again.");
  }
};

/**
 * Sends a request to create a new show.
 * 
 * @param {Object} show - The show object containing show details.
 * @param {string} show.showName - The name of the show.
 * @param {string} show.date - The date of the show.
 * @param {string} show.desc - The description of the show.
 */
const createShow = async (show) => {
  try {
    const response = await authorisedFetch("/createShow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(show),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      const errorMsg = data.errors ? data.errors.join("\n") : data.message || "Failed to create show";
      alert(`Error: ${errorMsg}`);
      return;
    }
    
    currentOffset = 0; // Reset pagination
    getShows();
  } catch (error) {
    console.error("Failed to create show", error);
    alert("Failed to create show. Please try again.");
  }
};

const setupEventListenersForShow = (show) => {
  const deleteBtn = document.getElementById(`deleteBtn-${show.name}`);
  if (deleteBtn) {
    deleteBtn.addEventListener("click", () => {
      const deleteShowButtonsure = document.getElementById("deleteShowButtonsure");
      const handler = async () => {
        await deleteShow(show);
        const deleteShowModalElement = document.getElementById("deleteShowModal");
        const deleteShowModal = bootstrap.Modal.getInstance(deleteShowModalElement);
        deleteShowModal.hide();
        deleteShowButtonsure.removeEventListener("click", handler);
      };
      deleteShowButtonsure.addEventListener("click", handler);
    });
  }

  const updateBtn = document.getElementById(`updateBtn-${show.name}`);
  if (updateBtn) {
    updateBtn.addEventListener("click", () => {
      document.getElementById("updateshowName").value = show.name;
      // Convert DD.MM.YYYY to YYYY-MM-DD for the date input
      const [day, month, year] = show.date.split(".");
      document.getElementById("updateshowDate").value = `${year}-${month}-${day}`;
      document.getElementById("updateshowDescription").value = show.desc;

      const updateShowButton = document.getElementById("updateShowButton");
      const handler = async () => {
        const updatedShow = {
          name: document.getElementById("updateshowName").value,
          date: document.getElementById("updateshowDate").value,
          desc: document.getElementById("updateshowDescription").value,
        };
        await updateShow(show, updatedShow);
        const updateShowModalElement = document.getElementById("updateShowModal");
        const updateShowModal = bootstrap.Modal.getInstance(updateShowModalElement);
        updateShowModal.hide();
        updateShowButton.removeEventListener("click", handler);
      };
      updateShowButton.addEventListener("click", handler);
    });
  }
};

const initCreateShowButton = () => {
  const createShowButton = document.getElementById("createShowButton");
  if (!createShowButton) {
    return;
  }

  createShowButton.addEventListener("click", async () => {
    const show = {
      showName: document.getElementById("createshowName111").value,
      date: document.getElementById("createshowDate").value,
      desc: document.getElementById("createshowDescription").value,
    };
    await createShow(show);
    const createShowModalElement = document.getElementById("createShowModal");
    const createShowModal = bootstrap.Modal.getInstance(createShowModalElement);
    createShowModal.hide();
  });
};

const initLogout = async () => {
  const auth = await ensureAuth();
  const logoutButton = document.getElementById("logout");
  if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
      await signOut(auth);
      window.location.href = "manager-login.html";
    });
  }
};

const initialise = async () => {
  const auth = await ensureAuth();
  initCreateShowButton();
  initLogout();

  onAuthStateChanged(auth, (user) => {
    if (!user) {
      window.location.href = "manager-login.html";
      return;
    }
    getShows();
  });
};

window.addEventListener("DOMContentLoaded", () => {
  initialise().catch((error) => {
    console.error("Failed to initialise manager page", error);
    window.location.href = "manager-login.html";
  });
});