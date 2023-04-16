const { getvisitordata } = require("../controllers/visitor");
const express = require("express");

const router = express.Router();

/**
 * Handles the POST request to get visitor data.
 *
 * @route {POST} /visitordata
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The request body containing the visitor data.
 * @param {string} req.body.showdate - The date of the show the visitor attended.
 * @param {string} req.body.image - The image associated with the visitor.
 * @param {string} req.body.chipnum - The chip number of the dog associated with the visitor.
 * @param {Object} res - The Express response object.
 */
router.post("/visitordata", async (req, res) => {
  const response = await getvisitordata({
    showdate: req.body.showdate,
    image: req.body.image,
    chipnum: req.body.chipnum,
  });
  res.send(response);
});

module.exports = router;

/*
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
);*/
