fetch = require("node-fetch");

const getdatafrommoagdb = async (ChipNum) => {
  console.log(ChipNum);
  const url = "https://dogsearch.moag.gov.il/api/GetAnimalDetails";
  const senddata = { SearchParam: ChipNum, top: 10, skip: 0 };
  try {
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(senddata),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    console.log(data);
    console.log(response);
    return data;
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getdatafrommoagdb,
};
