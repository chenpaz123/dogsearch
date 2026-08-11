const express = require("express");
const router = express.Router();
const requireFirebaseAuth = require("../middleware/auth.middleware");
const {
  createShow,
  updateshow,
  deleteShow,
  getallshows,
} = require("../controllers/manager.controller");
const { createLogger } = require("../utils/logger.util");
const { 
  validate, 
  validateQuery,
  createShowSchema,
  updateShowSchema,
  deleteShowSchema,
  paginationSchema,
} = require("../middleware/validation.middleware");

const logger = createLogger("router:manager");

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
router.post("/createShow", requireFirebaseAuth, validate(createShowSchema), async (req, res) => {
  logger.info("createShow request", { showName: req.body.showName, date: req.body.date });
  const response = await createShow(req.body.showName, req.body.date, req.body.desc);
  res.status(response.status).json(response);
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
router.patch("/updateShow", requireFirebaseAuth, validate(updateShowSchema), async (req, res) => {
  const { oldshow, updatedshow } = req.body;
  logger.info("updateShow request", { oldshow, updatedshow });
  const response = await updateshow(oldshow, updatedshow);
  res.status(response.status).json(response);
});

/**
 * Handles the DELETE request to delete a show.
 *
 * @route {DELETE} /deleteShow
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The request body containing the show information.
 * @param {Object} res - The Express response object.
 */
router.delete("/deleteShow", requireFirebaseAuth, validate(deleteShowSchema), async (req, res) => {
  logger.info("deleteShow request", { show: req.body });
  const response = await deleteShow(req.body);
  res.status(response.status).json(response);
});

/**
 * Handles the GET request to retrieve all shows with pagination.
 *
 * @route {GET} /getallshows
 * @param {Object} req - The Express request object.
 * @param {Object} req.query.limit - Maximum number of shows to return (default: 50)
 * @param {Object} req.query.offset - Number of shows to skip (default: 0)
 * @param {Object} res - The Express response object.
 */
router.get("/getallshows", requireFirebaseAuth, validateQuery(paginationSchema), async (req, res) => {
  const response = await getallshows(req.query.limit, req.query.offset);
  res.status(response.status).json(response);
});

module.exports = router;
