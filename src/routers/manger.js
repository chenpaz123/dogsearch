const express = require("express");
const router = express.Router();
const { createShow, updateshow, deleteShow } = require("../controllers/manger");

router.post("/createShow", async (req, res) => {
  const KenelClubName = req.body.KenelClubName;
  const date = req.body.date;
  const response = await createShow(KenelClubName, date);
  res.send(response);
});

router.patch("/updateshow", async (req, res) => {
  const KenelClubName = req.body.KenelClubName;
  const date = req.body.date;
  const newkennelclub = req.body.newkennelclub;
  const newdate = req.body.newdate;
  const response = await updateshow(
    KenelClubName,
    date,
    newkennelclub,
    newdate
  );
  res.send(response);
});

router.delete("/deleteShow", async (req, res) => {
  const KenelClubName = req.body.KenelClubName;
  const date = req.body.date;
  const response = await deleteShow(KenelClubName, date);
  res.send(response);
});

module.exports = router;
