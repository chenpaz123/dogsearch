const express = require("express");
const router = express.Router();
const {
  createShow,
  updateshow,
  deleteShow,
  getallshows,
} = require("../controllers/manger");

/**
 * Handles the POST request to create a new show.
 *
 * @route {POST} /createShow
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The request body containing the show information.
 * @param {string} req.body.showName - The name of the show.
 * @param {string} req.body.date - The date of the show.
 * @param {string} req.body.desc - The description of the show.
 * @param {Object} res - The Express response object.
 */
router.post("/createShow", async (req, res) => {
  const showName = req.body.showName;
  const date = req.body.date;
  const desc = req.body.desc;
  const response = await createShow(showName, date, desc);
  res.send(response);
});

/**
 * Handles the PATCH request to update an existing show.
 *
 * @route {PATCH} /updateshow
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The request body containing the show information.
 * @param {Object} req.body.oldshow - The object containing the old show details.
 * @param {Object} req.body.updatedshow - The object containing the updated show details.
 * @param {Object} res - The Express response object.
 */
router.patch("/updateshow", async (req, res) => {
  oldshow = req.body.oldshow;
  updatedshow = req.body.updatedshow;
  console.log(oldshow, updatedshow);
  const response = await updateshow(oldshow, updatedshow);
  res.send(response);
});

/**
 * Handles the DELETE request to delete a show.
 *
 * @route {DELETE} /deleteShow
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The request body containing the show information.
 * @param {Object} res - The Express response object.
 */
router.delete("/deleteShow", async (req, res) => {
  console.log(req.body);
  console.log("in router");
  const getshow = req.body;
  const response = await deleteShow(getshow);
  res.send(response);
});

/**
 * Handles the GET request to retrieve all shows.
 *
 * @route {GET} /getallshows
 * @param {Object} req - The Express request object.
 * @param {Object} res - The Express response object.
 */
router.get("/getallshows", async (req, res) => {
  const response = await getallshows();
  res.send(response);
});

module.exports = router;
