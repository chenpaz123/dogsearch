const express = require("express");
const router = express.Router();
const { addDogToShow, getchipfromesp } = require("../controllers/dogs");

router.post("/GetChipNumFromESP/:ChipNum", (req, res) => {
  global.ChipNum = req.params.ChipNum;
  console.log(global.ChipNum);
  res.send({
    message: "Chip number received",
    ChipNum: global.ChipNum,
  });
  /*
  getchipfromesp(req.params)
    .then((data) => {
      res.send(data);
    })
    .catch((error) => {
      console.log(error);
    });*/
});

router.post("/addDogToShow", async (req, res) => {
  const response = await addDogToShow({
    ChipNum: global.ChipNum,
    Show: req.body.Show,
  });
  res.send(response);
});

router.post("/adddog", async (req, res) => {
  const response = await adddog({ ChipNum: req.body.ChipNum });
  res.send(response);
});

module.exports = router;
