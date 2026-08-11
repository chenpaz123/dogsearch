const HTTP_STATUS = require('../constants/http-status');

const createResponse = (status, message, data = {}) => ({
  status,
  message,
  ...data,
});

const successResponse = (message, data = {}) =>
  createResponse(HTTP_STATUS.OK, message, data);

const createdResponse = (message, data = {}) =>
  createResponse(HTTP_STATUS.CREATED, message, data);

const errorResponse = (status, message, data = {}) =>
  createResponse(status, message, data);

module.exports = {
  createResponse,
  successResponse,
  createdResponse,
  errorResponse,
};
