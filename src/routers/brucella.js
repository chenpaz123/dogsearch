const express = require("express");
const router = express.Router();
const { brucellafiresotre } = require("../controllers/brucella");

/**
 * Handles the POST request to add a Brucella test date for a dog in a specific show.
 *
 * @route {POST} /brucellafiresotre
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The request body containing the show, chipnum, and date.
 * @param {string} req.body.show - The show in which the dog is participating.
 * @param {string} req.body.chipnum - The chip number of the dog.
 * @param {string} req.body.date - The date of the Brucella test.
 * @param {Object} res - The Express response object.
 */
router.post("/brucellafiresotre", async (req, res) => {
  const { chipnum, show, date } = req.body;
  const brucella = await brucellafiresotre(show, chipnum, date);
  res.send(brucella);
});

module.exports = router;
