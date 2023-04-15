import { getShows } from "./getshows.js";

document.addEventListener("DOMContentLoaded", function () {
  getShows();
});

const onFormSubmit = async () => {
  document.getElementById("loading-modal").classList.add("show");
  document.getElementById("loading-modal").style.display = "block";
  console.log("in onFormSubmit");
  console.log(document.getElementById("show-list").value);
  var show = document.getElementById("show-list").value;
  var showdate = extractDate(show);
  var chipnum = document.getElementById("chipnum").value;
  var brucelladate = document.getElementById("brucelladate").value;
  const file = document.getElementById("file").files[0];
  const fileurl = await getimageurl(file);
  await sendData(showdate, show, chipnum, fixdate(brucelladate), fileurl);
};
function fixdate(date) {
  const [year, month, day] = date.split("-");
  date = `${day}/${month}/${year}`;
  console.log(date);
  return date;
}
document.getElementById("button1").addEventListener("click", onFormSubmit);

const sendData = async (showdate, show, chipnum, brucelladate, image) => {
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
    document.getElementById("loading-modal").classList.remove("show");
    document.getElementById("loading-modal").style.display = "none";
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
            if (data2["status"] == 201) {
              alert("ברוצלה נוספה בהצלחה");
            }
          } catch (error) {
            console.log(error);
            alert(`brucella not added because of error: ${error}`);
          }
        } else {
          if (data["chip"] !== chipnum && data["status"] !== 401) {
            console.log("in chipnum else");
            console.log(data["chip"]);
            console.log(chipnum);
            alert("מספר שבב לא תואם");
            location.reload();
          }
          if (
            data["date"] !== brucelladate &&
            data["status"] !== 402 &&
            data["status"] !== 403
          ) {
            console.log(brucelladate);
            alert("תאריך ברוצלה לא תואם");
            location.reload();
          }
        }
        break;

      case 402:
        alert("ברוצלה לא בתוקף");
        location.reload();
        break;

      case 403:
        alert("אין תאריך ברוצלה");
        location.reload();
        break;

      case 401:
        alert("אין מספר שבב");
        location.reload();
        break;

      case 405:
        alert("אין תמונה");
        location.reload();
        break;

      case 406:
        alert("מספר שבב לא תואם");
        location.reload();
        break;
      case 407:
        alert("ברוצלה לא שלילית");
        location.reload();
        break;

      default:
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
