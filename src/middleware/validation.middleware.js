const Joi = require('joi');
const HTTP_STATUS = require('../constants/http-status');
const ERROR_MESSAGES = require('../constants/error-messages');
const { isValidFirestoreDocId } = require('../utils/firestore-id.util');

// Rejects values that would be unsafe to use as a Firestore document ID
// (e.g. containing "/", which the Admin SDK treats as a path separator).
const firestoreDocId = (value, helpers) => {
  if (!isValidFirestoreDocId(value)) {
    return helpers.error('any.invalid');
  }
  return value;
};

// Generic validation middleware
const validate = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { abortEarly: false });
  
  if (error) {
    const details = error.details.map(detail => detail.message);
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      status: HTTP_STATUS.BAD_REQUEST,
      message: ERROR_MESSAGES.VALIDATION_FAILED,
      errors: details,
    });
  }
  
  req.body = value; // Use validated/sanitized value
  next();
};

// Query parameter validation
const validateQuery = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.query, { abortEarly: false });
  
  if (error) {
    const details = error.details.map(detail => detail.message);
    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      status: HTTP_STATUS.BAD_REQUEST,
      message: ERROR_MESSAGES.VALIDATION_FAILED,
      errors: details,
    });
  }
  
  req.query = value;
  next();
};

// Schemas
const visitorDataSchema = Joi.object({
  showdate: Joi.string().required(),
  image: Joi.string().required().max(10 * 1024 * 1024), // 10MB limit
  chipnum: Joi.string().pattern(/^\d{15}$/).optional(),
  show: Joi.string().optional(),
  brucelladate: Joi.string().optional(),
});

const addDogSchema = Joi.object({
  data: Joi.object({
    AnimalDetails: Joi.array().items(Joi.object()).optional(),
  }).optional(),
  Show: Joi.string().required().custom(firestoreDocId, 'Firestore document id safety check'),
  ChipNum: Joi.alternatives().try(
    Joi.string().pattern(/^\d{15}$/),
    Joi.number()
  ).optional(),
});

const createShowSchema = Joi.object({
  showName: Joi.string().required().trim().min(1).max(200),
  date: Joi.string().required(),
  desc: Joi.string().allow('').optional().max(1000),
});

const updateShowSchema = Joi.object({
  oldshow: Joi.object({
    name: Joi.string().required(),
    date: Joi.string().required(),
  }).required(),
  updatedshow: Joi.object({
    name: Joi.string().required(),
    date: Joi.string().required(),
    desc: Joi.string().allow('').optional(),
  }).required(),
});

const deleteShowSchema = Joi.object({
  name: Joi.string().required(),
  date: Joi.string().required(),
});

const brucellaSchema = Joi.object({
  show: Joi.string().required(),
  chip: Joi.string().pattern(/^\d{15}$/).required(),
  brucella: Joi.string().required(),
});

const vetLoginSchema = Joi.object({
  licenseNumber: Joi.string().required().trim().min(1).max(50),
});

const paginationSchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(50),
  offset: Joi.number().integer().min(0).default(0),
});

module.exports = {
  validate,
  validateQuery,
  visitorDataSchema,
  addDogSchema,
  createShowSchema,
  updateShowSchema,
  deleteShowSchema,
  brucellaSchema,
  vetLoginSchema,
  paginationSchema,
};
