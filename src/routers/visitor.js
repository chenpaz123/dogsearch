const { getvisitordata } = require("../controllers/visitor");
const express = require("express");

const router = express.Router();

router.post("/visitordata", async (req, res) => {
  const response = await getvisitordata({
    showdate: req.body.showdate,
    kennelclubname: req.body.kennelclubname,
    image: req.body.image,
  });
  res.send(response);
});

router.get(
  "/visitordata/:showdate/:kennelclubname/:image",
  async (req, res) => {
    const response = await getvisitordata({
      showdate: req.params.showdate,
      kennelclubname: req.params.kennelclubname,
      image: req.params.image,
    });
    res.send(response);
  }
);
module.exports = router;
