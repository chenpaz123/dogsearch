const express = require("express");
const router = express.Router();
const { vetLogin } = require("../controllers/vet");

/**
 * Handles the POST request for vet login.
 *
 * @route {POST} /vetlogin
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The request body containing the license number.
 * @param {string} req.body.password - The license number.
 * @param {Object} res - The Express response object.
 */
router.post("/vetlogin", async (req, res) => {
  const password = req.body.password;
  const response = await vetLogin(password);
  res.status(response.status).send(response);
});

module.exports = router;
