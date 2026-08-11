# Firebase Configuration Constants

# These constants provide better readability and maintainability for magic numbers

# Cache TTL values (in milliseconds)

DEFAULT_CACHE_TTL_MS=30000 # 30 seconds - default cache duration
SHOWS_CACHE_TTL_MS=60000 # 60 seconds - show list cache duration  
DOG_CACHE_TTL_MS=15000 # 15 seconds - individual dog cache duration

# Rate Limiting

RATE_LIMIT_WINDOW_MS=900000 # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100 # Max requests per window
OCR_RATE_LIMIT_WINDOW_MS=60000 # 1 minute for OCR
OCR_RATE_LIMIT_MAX_REQUESTS=10 # Max OCR requests per window

# Upload Limits

MAX_UPLOAD_SIZE_BYTES=8388608 # 8 MB (8 _ 1024 _ 1024)
MAX_BODY_SIZE=10485760 # 10 MB for JSON bodies

# Validation

CHIP_NUMBER_LENGTH=15 # Standard chip number length
MAX_SHOW_NAME_LENGTH=200 # Maximum show name length
MAX_DESCRIPTION_LENGTH=1000 # Maximum description length
BRUCELLA_VALIDITY_DAYS=365 # Days until Brucella test expires
VACCINATION_VALIDITY_DAYS=365 # Days until vaccination expires

# Logging

LOG_LEVEL=info # Default log level (error, warn, info, debug)
LOG_SILENT=false # Set to true to silence logs in production
