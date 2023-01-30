const express = require("express");
const router = express.Router();
const {
  createShow,
  updateshow,
  deleteShow,
  authmanger,
  loginmanger,
  getallshows,
  deleteManger,
  logoutmanger,
} = require("../controllers/manger");

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

router.post("/authmanger", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const response = await authmanger(email, password);
  res.send(response);
});

router.get("/getallshows", async (req, res) => {
  const response = await getallshows();
  res.send(response);
});

router.post("/loginmanger", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const response = await loginmanger(email, password);
  res.send(response);
});

router.delete("/deleteManger", async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const response = await deleteManger(email, password);
  res.send(response);
});

router.post("/logoutmanger", async (req, res) => {
  const response = await logoutmanger();
  res.send(response);
});

module.exports = router;
