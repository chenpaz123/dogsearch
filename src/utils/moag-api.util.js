const fetch = require("node-fetch");
const { createLogger } = require("./logger.util");

const logger = createLogger("utils:getdatafrommoagdb");

const MOAG_URL = "https://dogsearch.moag.gov.il/api/GetAnimalDetails";

// MOAG's site sits behind an AWS WAF that can challenge requests that don't
// look like they came from a real browser. These headers mirror what their
// own Angular app sends for a same-origin search, so a plain node-fetch
// request isn't trivially distinguishable as a bare script by header
// inspection alone (this does not, and cannot, bypass TLS/JA3-level
// fingerprinting or an actual interactive CAPTCHA challenge).
const BROWSER_LIKE_HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9,he;q=0.8",
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
  Origin: "https://dogsearch.moag.gov.il",
  Referer: "https://dogsearch.moag.gov.il/",
};

const getdatafrommoagdb = async (ChipNum) => {
  logger.debug("querying moag db", { chip: ChipNum });
  const senddata = { SearchParam: String(ChipNum), top: 10, skip: 0 };

  let response;
  try {
    response = await fetch(MOAG_URL, {
      method: "POST",
      body: JSON.stringify(senddata),
      headers: BROWSER_LIKE_HEADERS,
    });
  } catch (error) {
    logger.error("moag db request failed", { error: error.message, chip: ChipNum });
    throw new Error(`moag db request failed: ${error.message}`);
  }

  const rawBody = await response.text();
  const diagnostics = {
    status: response.status,
    contentType: response.headers.get("content-type"),
    wafAction: response.headers.get("x-amzn-waf-action"),
    bodyPreview: rawBody.slice(0, 300),
    chip: ChipNum,
  };

  if (!response.ok) {
    logger.error("moag db returned non-OK status", diagnostics);
    throw new Error(`moag db returned status ${response.status}`);
  }

  try {
    const data = JSON.parse(rawBody);
    logger.debug("moag db response", { ok: response.ok, status: response.status });
    return data;
  } catch (parseError) {
    logger.error("moag db returned non-JSON body (likely a WAF challenge page)", diagnostics);
    throw new Error(
      `moag db returned a non-JSON response (status ${response.status}); likely blocked by their WAF`
    );
  }
};

module.exports = {
  getdatafrommoagdb,
};
