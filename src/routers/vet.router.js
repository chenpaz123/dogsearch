const express = require("express");
const router = express.Router();
const { vetLogin } = require("../controllers/vet.controller");
const { validate, vetLoginSchema } = require("../middleware/validation.middleware");

/**
 * Handles the POST request for vet login.
 *
 * @route {POST} /vetlogin
 * @param {Object} req - The Express request object.
 * @param {Object} req.body - The request body.
 * @param {string} req.body.licenseNumber - The vet's license number.
 * @param {Object} res - The Express response object.
 */
router.post("/vetlogin", validate(vetLoginSchema), async (req, res) => {
  const response = await vetLogin(req.body.licenseNumber);
  res.status(response.status).json(response);
});

module.exports = router;
