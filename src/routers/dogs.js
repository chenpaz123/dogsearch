const express = require("express");
const router = express.Router();
const { addDogToShow } = require("../controllers/dogs");

router.post("/addDogToShow", async (req, res) => {
  const response = await addDogToShow({
    //ChipNum: req.body.ChipNum,
    data: req.body.data,
    Show: req.body.Show,
  });
  res.send(response);
});

module.exports = router;
