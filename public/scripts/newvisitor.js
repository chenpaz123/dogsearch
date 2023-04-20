import { getShows } from "./getshows.js";

document.addEventListener("DOMContentLoaded", function () {
  getShows();
});

const onFormSubmit = async () => {
  document.getElementById("loading-modal").style.display = "block";
  console.log("in onFormSubmit");
  console.log(document.getElementById("show-list").value);
  var show = document.getElementById("show-list").value;
  var chipnum = document.getElementById("chipnum").value;
  var brucelladate = document.getElementById("brucelladate").value;
  const file = document.getElementById("file").files[0];
  const fileurl = await getimageurl(file);
  await sendData(show, chipnum, fixdate(brucelladate), fileurl);
};
document.getElementById("button1").addEventListener("click", onFormSubmit);

function fixdate(date) {
  const [year, month, day] = date.split("-");
  date = `${day}/${month}/${year}`;
  console.log(date);
  return date;
}

const sendData = async (show, chipnum, brucelladate, image) => {
  const showdate = extractDate(show);
  try {
    console.log("in try");

    const res = await fetch("http://localhost:3000/visitordata", {
      method: "POST",
      body: JSON.stringify({
        showdate: showdate,
        image: image,
        chipnum: chipnum,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("after fetch");
    const data = await res.json();
    console.log("after json");
    console.log(data);

    switch (data["status"]) {
      case 201:
        if (data["date"] == brucelladate && data["chip"] == chipnum) {
          try {
            const res2 = await fetch(
              "http://localhost:3000/brucellafiresotre",
              {
                method: "POST",
                body: JSON.stringify({
                  show: show,
                  chipnum: chipnum,
                  date: brucelladate,
                }),
                headers: {
                  "Content-Type": "application/json",
                },
              }
            );
            const data2 = await res2.json();
            console.log(data2);
            document.getElementById("loading-modal").style.display = "none";
            alert("ברוצלה נוספה בהצלחה");
          } catch (error) {
            console.log(error);
            alert(`brucella not added because of error: ${error}`);
          }
        }
        break;

      case 401:
        document.getElementById("loading-modal").style.display = "none";
        alert("אין מספר שבב");
        location.reload();
        break;

      case 402:
        document.getElementById("loading-modal").style.display = "none";
        alert("ברוצלה לא בתוקף");
        location.reload();
        break;

      case 403:
        document.getElementById("loading-modal").style.display = "none";
        alert("אין תאריך ברוצלה");
        location.reload();
        break;

      case 405:
        document.getElementById("loading-modal").style.display = "none";
        alert("אין תמונה");
        location.reload();
        break;

      case 406:
        document.getElementById("loading-modal").style.display = "none";
        alert("מספר שבב לא תואם");
        location.reload();
        break;
      case 407:
        document.getElementById("loading-modal").style.display = "none";
        alert("ברוצלה לא שלילית");
        location.reload();
        break;

      default:
        document.getElementById("loading-modal").style.display = "none";
        alert("שגיאה בהוספת ברוצלה");
        location.reload();
        break;
    }
  } catch (error) {
    console.log("in catch");
    console.log(error);
    alert(`brucella not added because of error: ${error}`);
  }
};

const getimageurl = async (image) => {
  const fd = new FormData();
  fd.append("image", image);
  const res = await fetch("https://api.imgur.com/3/image/", {
    method: "POST",
    headers: {
      Authorization: "Client-ID 24b0bf9b2a9f520",
    },
    body: fd,
  });
  const data = await res.json();
  console.log(data.data.link);
  return data.data.link;
};

const extractDate = (str) => {
  return str.split("-")[1].trim();
};
