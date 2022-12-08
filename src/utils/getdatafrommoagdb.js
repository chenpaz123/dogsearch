fetch = require("node-fetch");

const getdatafrommoagdb = async ({ ChipNum }) => {
  const url = "https://dogsearch.moag.gov.il/api/GetAnimalDetails";
  const senddata = { SearchParam: ChipNum, top: 10, skip: 0 };
  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify(senddata),
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();

  return data;

  console.log(data);
  console.log(response);
};

module.exports = {
  getdatafrommoagdb,
};
