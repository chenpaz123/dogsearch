const express = require("express");
const router = express.Router();
const {
  createShow,
  updateshow,
  deleteShow,
  getallshows,
} = require("../controllers/manger");

router.post("/createShow", async (req, res) => {
  const KenelClubName = req.body.KenelClubName;
  const date = req.body.date;
  const desc = req.body.desc;
  const response = await createShow(KenelClubName, date, desc);
  res.send(response);
});

router.patch("/updateshow", async (req, res) => {
  oldshow = req.body.oldshow;
  updatedshow = req.body.updatedshow;
  console.log(oldshow, updatedshow);
  const response = await updateshow(oldshow, updatedshow);
  res.send(response);
});

router.delete("/deleteShow", async (req, res) => {
  console.log(req.body);
  console.log("in router");
  const getshow = req.body;
  const response = await deleteShow(getshow);
  res.send(response);
});

router.get("/getallshows", async (req, res) => {
  const response = await getallshows();
  res.send(response);
});

module.exports = router;
