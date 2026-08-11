const util = require("node:util");

const LEVELS = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
};

const parseLogLevel = (value) => {
  if (!value) {
    return null;
  }
  const normalised = value.toString().trim().toLowerCase();
  return LEVELS.hasOwnProperty(normalised) ? normalised : null;
};

const envLevel =
  parseLogLevel(process.env.LOG_LEVEL) ||
  (process.env.NODE_ENV === "test" ? "warn" : "info");

const threshold = LEVELS[envLevel] ?? LEVELS.info;
const silent = ["1", "true", "yes"].includes(
  (process.env.LOG_SILENT || "").toString().trim().toLowerCase()
);

const formatError = (error) => {
  if (!error) {
    return undefined;
  }
  return {
    message: error.message,
    stack: error.stack,
    name: error.name,
    ...Object.entries(error)
      .filter(([key]) => !["message", "stack", "name"].includes(key))
      .reduce((acc, [key, value]) => ({
        ...acc,
        [key]: value,
      }), {}),
  };
};

const baseLog = (level, namespace, message, meta) => {
  if (silent && level !== "error") {
    return;
  }

  if ((LEVELS[level] ?? LEVELS.error) > threshold) {
    return;
  }

  const timestamp = new Date().toISOString();
  const parts = [timestamp, level.toUpperCase()];
  if (namespace) {
    parts.push(namespace);
  }

  let metaPayload = meta;
  let messagePayload = message;

  if (message instanceof Error) {
    metaPayload = {
      ...metaPayload,
      error: formatError(message),
    };
    messagePayload = message.message;
  }

  const serialise = (value) => {
    if (value === undefined) {
      return "";
    }
    if (typeof value === "string") {
      return value;
    }
    if (value instanceof Error) {
      return value.message;
    }
    return util.inspect(value, { depth: null, breakLength: Infinity });
  };

  const baseLine = `[${parts.join(" ")}] ${serialise(messagePayload)}`.trim();
  const consoleMethod =
    level === "error" ? console.error : level === "warn" ? console.warn : console.log;

  if (metaPayload && Object.keys(metaPayload).length > 0) {
    consoleMethod(baseLine, serialise(metaPayload));
  } else {
    consoleMethod(baseLine);
  }
};

const createLogger = (namespace) => ({
  error: (message, meta) => baseLog("error", namespace, message, meta),
  warn: (message, meta) => baseLog("warn", namespace, message, meta),
  info: (message, meta) => baseLog("info", namespace, message, meta),
  debug: (message, meta) => baseLog("debug", namespace, message, meta),
});

const rootLogger = createLogger();

module.exports = {
  createLogger,
  logger: rootLogger,
};
