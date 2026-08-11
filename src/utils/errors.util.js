const HTTP_STATUS = require('../constants/http-status');

class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, HTTP_STATUS.BAD_REQUEST);
  }
}

class NotFoundError extends AppError {
  constructor(message) {
    super(message, HTTP_STATUS.NOT_FOUND);
  }
}

class ConflictError extends AppError {
  constructor(message) {
    super(message, HTTP_STATUS.CONFLICT);
  }
}

class UnauthorizedError extends AppError {
  constructor(message) {
    super(message, HTTP_STATUS.UNAUTHORIZED);
  }
}

class ForbiddenError extends AppError {
  constructor(message) {
    super(message, HTTP_STATUS.FORBIDDEN);
  }
}

class ServiceUnavailableError extends AppError {
  constructor(message) {
    super(message, HTTP_STATUS.SERVICE_UNAVAILABLE);
  }
}

class UnprocessableEntityError extends AppError {
  constructor(message) {
    super(message, HTTP_STATUS.UNPROCESSABLE_ENTITY);
  }
}

module.exports = {
  AppError,
  ValidationError,
  NotFoundError,
  ConflictError,
  UnauthorizedError,
  ForbiddenError,
  ServiceUnavailableError,
  UnprocessableEntityError,
};
