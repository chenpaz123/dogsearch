const express = require("express");
const { addshow, getshows } = require("../controllers/shows.controller");
const requireFirebaseAuth = require("../middleware/auth.middleware");
const { createLogger } = require("../utils/logger.util");

const router = express.Router();

const logger = createLogger("router:shows");

/**
 * Handles the GET request to retrieve all shows (public).
 *
 * @route {GET} /getshows
 */
router.get("/getshows", async (req, res) => {
  const response = await getshows();
  res.send(response);
});

/**
 * Handles the POST request to add a new show.
 *
 * @route {POST} /addshow
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The request body containing the show information.
 * @param {string} req.body.KenelClubName - The name of the kennel club.
 * @param {Object} res - The Express response object.
 */
router.post("/addshow", requireFirebaseAuth, async (req, res) => {
  const response = await addshow({ KenelClubName: req.body.KenelClubName });
  res.status(response.status || 200).send(response);
});

module.exports = router;