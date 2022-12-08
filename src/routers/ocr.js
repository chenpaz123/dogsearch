const express = require("express");
const router = express.Router();
const { ocr } = require("../controllers/ocr");

router.post("/ocr", async (req, res) => {
  const image = req.body.image;
  const response = await ocr(image);
  res.send(response);
});

module.exports = router;
