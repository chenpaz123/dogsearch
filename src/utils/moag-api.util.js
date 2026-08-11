const fetch = require("node-fetch");
const { createLogger } = require("./logger.util");

const logger = createLogger("utils:getdatafrommoagdb");

const getdatafrommoagdb = async (ChipNum) => {
  logger.debug("querying moag db", { chip: ChipNum });
  const url = "https://dogsearch.moag.gov.il/api/GetAnimalDetails";
  const senddata = { SearchParam: String(ChipNum), top: 10, skip: 0 };
  try {
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(senddata),
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await response.json();
    logger.debug("moag db response", { ok: response.ok, status: response.status });
    return data;
  } catch (error) {
    logger.error("failed to fetch moag db data", { error, chip: ChipNum });
    throw error;
  }
};

module.exports = {
  getdatafrommoagdb,
};
