const express = require("express");
const { brucellaFirestore } = require("../controllers/brucella.controller");
const requireFirebaseAuth = require("../middleware/auth.middleware");
const { validate, brucellaSchema } = require("../middleware/validation.middleware");

const router = express.Router();

router.post("/brucellafirestore", requireFirebaseAuth, validate(brucellaSchema), async (req, res) => {
  const { chip, show, brucella } = req.body;
  const response = await brucellaFirestore(show, chip, brucella);
  res.status(response.status).json(response);
});

module.exports = router;