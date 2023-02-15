document.getElementById("form").addEventListener("submit", (e) => {
  e.preventDefault();
  sendShowData();
});

const sendShowData = async () => {
  try {
    const date = document.getElementById("date").value;
    const KenelClubName = document.getElementById("selection").value;
    console.log(date);
    console.log(KenelClubName);
    const payload = { date, KenelClubName };
    console.log(payload);
    const response = await fetch("http://localhost:3000/createshow", {
      method: "POST",
      body: JSON.stringify(payload),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    console.log(data);
    if (data.status == 200) {
      alert("התערוכה נוצרה בהצלחה");
    } else if (data.status == 400) {
      alert("התערוכה כבר קיימת");
    }
  } catch (error) {
    console.error(error);
  }
};
