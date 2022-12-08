const express = require("express");
const router = express.Router();
const { brucellafiresotre } = require("../controllers/brucella");

router.post("/brucellafiresotre", async (req, res) => {
  const { chipnum, date, KenelClubName, ShowDate } = req.body;
  const brucella = await brucellafiresotre(
    chipnum,
    date,
    KenelClubName,
    ShowDate
  );
  res.send(brucella);
});

module.exports = router;
