const express = require("express");
const app = express();
const cors = require("cors");
const dogsrouter = require("./routers/dogs");
const showsrouter = require("./routers/shows");
const ocrrouter = require("./routers/ocr");
const visitordatarouter = require("./routers/visitor");
const brucellarouter = require("./routers/brucella");
process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0";

app.use(
  cors({
    origin: "*",
  })
);
app.use(
  express.json({
    type: ["application/json", "text/plain", "multipart/form-data"],
  })
);

app.use(express.urlencoded({ extended: true }));
app.use(dogsrouter);
app.use(showsrouter);
app.use(ocrrouter);
app.use(visitordatarouter);
app.use(brucellarouter);

app.get("/", (req, res) => {
  res.send({
    message: "Hello World",
    status: 200,
  });
});

module.exports = app;
