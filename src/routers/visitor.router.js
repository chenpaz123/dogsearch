const { getvisitordata } = require('../controllers/visitor.controller');
const express = require('express');
const { validate, visitorDataSchema } = require('../middleware/validation.middleware');
const { createLogger } = require('../utils/logger.util');

const router = express.Router();
const logger = createLogger('router:visitor');

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
router.post('/visitordata', validate(visitorDataSchema), async (req, res) => {
  logger.debug('processing visitor data request', {
    hasImage: !!req.body.image,
    hasChipnum: !!req.body.chipnum,
    hasShow: !!req.body.show,
    brucelladate: req.body.brucelladate,
  });
  
  const response = await getvisitordata({
    showdate: req.body.showdate,
    image: req.body.image,
    chipnum: req.body.chipnum,
    show: req.body.show,
    brucelladate: req.body.brucelladate,
  });
  
  res.status(response.status).json(response);
});

module.exports = router;
