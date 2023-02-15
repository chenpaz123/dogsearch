const express = require("express");
const router = express.Router();
const { brucellafiresotre } = require("../controllers/brucella");

router.post("/brucellafiresotre", async (req, res) => {
  const { chipnum, show, date } = req.body;
  const brucella = await brucellafiresotre(show, chipnum, date);
  res.send(brucella);
});

module.exports = router;
