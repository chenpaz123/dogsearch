const express = require("express");
const router = express.Router();
const { ocr } = require("../controllers/ocr.controller");

router.post("/ocr", async (req, res) => {
  const image = req.body.image;
  const response = await ocr(image);
  res.status(response.status || 200).send(response);
});

module.exports = router;
