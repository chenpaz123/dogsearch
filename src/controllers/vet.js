const fetch = require("node-fetch");

const vetLogin = async (password) => {
  const url = `https://data.gov.il/api/3/action/datastore_search?resource_id=14339de6-278c-49ed-a6c1-307044aaee3f&limit=5&q=${password}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.result.records.length == 0) {
      return { status: 400, message: "משתמש לא קיים" };
    }
    const newdata = data.result.records[0];
    const {
      שם_פרטי: vetfirstname,
      שם_משפחה: vetlastname,
      מספר_רשיון: licensenumber,
    } = newdata;

    if (licensenumber == password) {
      return {
        status: 200,
        message: "success",
        vetfirstname,
        vetlastname,
        licensenumber,
      };
    } else {
        return { status: 400, message: "משתמש לא קיים" };
    }
  } catch (error) {
    console.log(error);
    return { status: 500, message: "Internal server error" };
  }
};

module.exports = { vetLogin };
