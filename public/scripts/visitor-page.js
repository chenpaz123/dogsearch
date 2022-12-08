document.getElementById("button1").addEventListener("click", onFormSubmit);
async function onFormSubmit() {
  event.preventDefault();
  showdate = document.getElementById("showdate").value;
  chipnum = document.getElementById("chipnum").value;
  kennelclubname = document.getElementById("kennelclubname").value;
  brucelladate = document.getElementById("brucelladate").value;
  file = document.getElementById("file").files[0];
  const fileurl = await getimageurl(file);
  console.log(chipnum);
  sendData(
    fixdate(showdate),
    chipnum,
    kennelclubname,
    fixdate(brucelladate),
    fileurl
  );
}
/*
const image = "C:\\Users\\chenp\\OneDrive\\Documents\\Project\\projecto\\node js\\src\\cd test.jpg";
*/

/*
const getimageurl = async (image) => {
  const storageRef = firebase.storage().ref();
  const fileRef = storageRef.child(image.name);
  await fileRef.put(image);
  return await fileRef.getDownloadURL();
};*/

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

//rewrite the sendData function in async await
const sendData = async (
  showdate,
  chipnum,
  kennelclubname,
  brucelladate,
  image
) => {
  const url = "http://localhost:3000/visitordata";
  try {
    console.log("in try");
    const res = await fetch(url, {
      method: "POST",
      body: JSON.stringify({
        showdate: showdate,
        kennelclubname: kennelclubname,
        image: image,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("after fetch");
    const data = await res.json();
    console.log("after json");
    console.log(data);
    if (data["date"] == brucelladate && data["chip"] == chipnum) {
      try {
        const res = await fetch("http://localhost:3000/brucellafiresotre", {
          method: "POST",
          body: JSON.stringify({
            chipnum: chipnum,
            date: brucelladate,
            KenelClubName: kennelclubname,
            ShowDate: showdate,
          }),
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data2 = await res.json();
        console.log(data2);
        if (data2["status"] == 201) {
          alert("ברוצלה נוספה בהצלחה");
        }
      } catch (error) {
        console.log(error);
        alert(`brucella not added because of error: ${error}`);
      }
    } else {
      if (data["status"] == 402) {
        alert("ברוצלה לא בתוקף");
        location.reload();
      } else {
        if (data["chip"] !== chipnum) {
          alert("מספר שבב לא תואם");
          location.reload();
        }
        if (data["date"] !== brucelladate) {
          alert("תאריך ברוצלה לא תואם");
          location.reload();
        }
      }
    }
  } catch (error) {
    console.log("in catch");
    console.log(error);
    alert(`brucella not added because of error: ${error}`);
  }
};

function fixdate(date) {
  const [year, month, day] = date.split("-");
  return `${day}/${month}/${year}`;
}
