process.env.FIREBASE_SERVICE_ACCOUNT = JSON.stringify({
  type: "service_account",
  project_id: "test-project",
  private_key_id: "test",
  private_key: "-----BEGIN PRIVATE KEY-----\nTEST\n-----END PRIVATE KEY-----\n",
  client_email: "test@test-project.iam.gserviceaccount.com",
  client_id: "1234567890",
});
process.env.FIREBASE_DATABASE_URL = "https://test.firebaseio.com";
process.env.ALLOWED_MANAGER_EMAILS = "admin@example.com";
process.env.ALLOWED_ORIGINS = "http://localhost:3001";

const makeLogger = (namespace) => {
  const logger = {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    __namespace: namespace,
  };
  makeLogger.loggers.push(logger);
  return logger;
};
makeLogger.loggers = [];

jest.mock("../src/utils/logger.util", () => {
  const { loggers } = makeLogger;
  const createLogger = jest.fn((namespace) => makeLogger(namespace));
  const rootLogger = makeLogger("root");
  return {
    createLogger,
    logger: rootLogger,
    __getLoggers: () => [...loggers],
  };
});

jest.mock("firebase-admin", () => {
  const mockAuth = { verifyIdToken: jest.fn() };
  return {
    credential: { cert: jest.fn() },
    initializeApp: jest.fn(),
    firestore: jest.fn(() => ({ collection: jest.fn() })),
    auth: () => mockAuth,
    __mockAuth: mockAuth,
  };
});

const { clearCache } = require("../src/utils/cache.util");
afterEach(() => {
  clearCache();
});

process.env.LOG_SILENT = "true";
