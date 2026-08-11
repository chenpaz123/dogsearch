module.exports = {
  // Validation Errors
  VALIDATION_FAILED: 'Validation failed',
  INVALID_INPUT: 'Invalid input provided',
  
  // Resource Errors
  RESOURCE_NOT_FOUND: 'Resource not found',
  RESOURCE_ALREADY_EXISTS: 'Resource already exists',
  
  // Authentication/Authorization
  MISSING_TOKEN: 'missing bearer token',
  INVALID_TOKEN: 'invalid authentication token',
  UNAUTHORIZED_USER: 'unauthorised user',
  
  // Business Logic
  DOG_NOT_FOUND: 'dog record not found',
  DOG_ALREADY_REGISTERED: 'dog already registered',
  SHOW_NOT_FOUND: 'show does not exist',
  SHOW_ALREADY_EXISTS: 'show already exists',
  MISSING_BRUCELLA: 'missing brucella record for dog in show',
  INVALID_VACCINATION: 'kalevet vaccination is not valid',
  DOG_ADDED: 'dog added to the show',
  
  // OCR/Brucella
  IMAGE_REQUIRED: 'image is required',
  CHIP_MISSING: 'chip number missing',
  CHIP_MISMATCH: 'chip number mismatch',
  BRUCELLA_NOT_VALID: 'brucella not valid',
  BRUCELLA_NOT_ADDED: 'brucella not added',
  BRUCELLA_DATE_MISSING: 'brucella date missing',
  BRUCELLA_RESULT_NOT_NEGATIVE: 'brucella result not negative',
  BRUCELLA_RESULT_UNKNOWN: 'could not determine brucella result',
  BRUCELLA_VALID_AND_SAVED: 'brucella is valid and saved',
  
  // External Services
  EXTERNAL_SERVICE_UNAVAILABLE: 'external registry unavailable',

  // Vet Login
  LICENSE_NUMBER_REQUIRED: 'license number is required',
  VET_NOT_FOUND: 'no veterinarian found for this license number',
  VET_LOGIN_SUCCESS: 'vet login successful',
  
  // Shows
  SHOW_NAME_DATE_REQUIRED: 'Show name and date are required',
  SHOW_CREATED: 'show created',
  SHOW_UPDATED: 'show updated',
  SHOW_DELETED: 'show deleted',
  SHOWS_RETURNED: 'shows returned',
  NO_SHOWS_AVAILABLE: 'no shows available',
  SHOW_NAME_REQUIRED: 'show name is required',
  INVALID_SHOW_ID: 'invalid show identifier',
  INVALID_CHIP_NUMBER: 'invalid chip number',
  INVALID_PAYLOAD: 'invalid payload',
  
  // Generic
  INTERNAL_ERROR: 'Internal Server Error',
};
