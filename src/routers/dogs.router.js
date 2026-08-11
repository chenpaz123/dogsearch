const express = require("express");
const router = express.Router();
const { addDogToShow } = require("../controllers/dogs.controller");
const { validate, addDogSchema } = require("../middleware/validation.middleware");

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
router.post("/addDogToShow", validate(addDogSchema), async (req, res) => {
  const response = await addDogToShow({
    data: req.body.data,
    Show: req.body.Show,
    ChipNum: req.body.ChipNum,
  });
  res.status(response.status).json(response);
});

module.exports = router;
