const express = require("express");
const router = express.Router();
const { addshow } = require("../controllers/shows");

router.post("/addshow", async (req, res) => {
  const response = await addshow({ KenelClubName: req.body.KenelClubName });
  res.send(response);
});

module.exports = router