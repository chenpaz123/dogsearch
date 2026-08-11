/**
 * Application Constants
 *
 * Centralized constants to replace magic numbers throughout the codebase.
 * This improves maintainability and makes the code more readable.
 */

// Cache Duration Constants (milliseconds)
const CACHE = {
  DEFAULT_TTL_MS: 30_000, // 30 seconds
  SHOWS_TTL_MS: 60_000, // 60 seconds (1 minute)
  DOG_TTL_MS: 15_000, // 15 seconds
};

// Rate Limiting Constants
const RATE_LIMIT = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUESTS: 100, // Max requests per window

  OCR: {
    WINDOW_MS: 1 * 60 * 1000, // 1 minute
    MAX_REQUESTS: 10, // Max OCR requests per minute
  },
};

// File Upload Constants
const UPLOAD = {
  MAX_SIZE_BYTES: 8 * 1024 * 1024, // 8 MB
  ALLOWED_EXTENSIONS: [".jpg", ".jpeg", ".png", ".heic", ".heif", ".webp"],
  ALLOWED_MIME_TYPES: [
    "image/jpeg",
    "image/png",
    "image/heic",
    "image/heif",
    "image/webp",
  ],
};

// Body Parser Constants
const BODY = {
  MAX_SIZE: "10mb",
};

// Validation Constants
const VALIDATION = {
  CHIP_NUMBER_LENGTH: 15,
  CHIP_NUMBER_PATTERN: /^\d{15}$/,
  MAX_SHOW_NAME_LENGTH: 200,
  MAX_DESCRIPTION_LENGTH: 1000,
  BRUCELLA_VALIDITY_DAYS: 365,
  VACCINATION_VALIDITY_DAYS: 365,
};

// Date Formats
const DATE_FORMATS = {
  SLASH: "DD/MM/YYYY",
  DOT: "DD.MM.YYYY",
  DASH: "DD-MM-YYYY",
  INPUT_FORMATS: [
    "DD/MM/YYYY",
    "D/M/YYYY",
    "DD/M/YYYY",
    "D/MM/YYYY",
    "YYYY/MM/DD",
    "YYYY/M/D",
    "DD.MM.YYYY",
    "DD-MM-YYYY",
  ],
};

// Pagination Constants
const PAGINATION = {
  DEFAULT_LIMIT: 50,
  MAX_LIMIT: 100,
  DEFAULT_OFFSET: 0,
};

// OCR Constants
const OCR = {
  DEFAULT_OEM: 1, // LSTM engine
  DEFAULT_PSM: 3, // Fully automatic page segmentation
  SUPPORTED_LANGUAGES: "eng+heb",
};

module.exports = {
  CACHE,
  RATE_LIMIT,
  UPLOAD,
  BODY,
  VALIDATION,
  DATE_FORMATS,
  PAGINATION,
  OCR,
};
