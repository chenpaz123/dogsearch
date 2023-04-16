const express = require("express");
const router = express.Router();
const { addDogToShow } = require("../controllers/dogs");

/**
 * Handles the POST request to add a dog to a specific show.
 *
 * @route {POST} /addDogToShow
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The request body containing the dog data and show information.
 * @param {Object} req.body.data - The dog data object.
 * @param {string} req.body.Show - The show in which the dog will participate.
 * @param {Object} res - The Express response object.
 */
router.post("/addDogToShow", async (req, res) => {
  const response = await addDogToShow({
    //ChipNum: req.body.ChipNum,
    data: req.body.data,
    Show: req.body.Show,
  });
  res.send(response);
});

module.exports = router;
