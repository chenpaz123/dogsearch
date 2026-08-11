const parseBool = (value) => {
  if (typeof value === 'boolean') return value;
  const str = String(value).toLowerCase().trim();
  return ['1', 'true', 'yes'].includes(str);
};

const parseArray = (value, delimiter = ',') => {
  if (!value) return [];
  return String(value)
    .split(delimiter)
    .map(item => item.trim())
    .filter(Boolean);
};

const config = {
  env: process.env.NODE_ENV || 'development',
  isDev: process.env.NODE_ENV !== 'production',
  port: parseInt(process.env.PORT || '3000', 10),
  
  cache: {
    defaultTtl: parseInt(process.env.CACHE_TTL_MS || '30000', 10),
    showsTtl: parseInt(process.env.SHOWS_CACHE_TTL_MS || '60000', 10),
    dogTtl: parseInt(process.env.DOG_CACHE_TTL_MS || '15000', 10),
  },
  
  firebase: {
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    serviceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
    serviceAccountJson: process.env.FIREBASE_SERVICE_ACCOUNT,
  },
  
  cors: {
    origins: parseArray(process.env.ALLOWED_ORIGINS),
  },
  
  auth: {
    allowedEmails: parseArray(process.env.ALLOWED_MANAGER_EMAILS),
  },
  
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    silent: parseBool(process.env.LOG_SILENT || 'false'),
  },
  
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
  },
  
  bodyLimit: '10mb',
};

// Validate required configuration
const validateConfig = () => {
  const required = [];
  
  if (!config.firebase.serviceAccountJson && !config.firebase.serviceAccountPath) {
    required.push('FIREBASE_SERVICE_ACCOUNT or FIREBASE_SERVICE_ACCOUNT_PATH');
  }
  
  if (!config.firebase.databaseURL) {
    required.push('FIREBASE_DATABASE_URL');
  }
  
  if (required.length > 0) {
    throw new Error(`Missing required environment variables: ${required.join(', ')}`);
  }
};

validateConfig();

Object.freeze(config);

module.exports = config;
