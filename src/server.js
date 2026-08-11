const express = require("express");
require("express-async-errors"); // Must be before routes
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const app = express();
const cors = require("cors");
const path = require("path");
const config = require("./config");
const HTTP_STATUS = require("./constants/http-status");
const dogsrouter = require("./routers/dogs.router");
const showsrouter = require("./routers/shows.router");
const ocrrouter = require("./routers/ocr.router");
const visitordatarouter = require("./routers/visitor.router");
const brucellarouter = require("./routers/brucella.router");
const managerrouter = require("./routers/manager.router");
const uploadrouter = require("./routers/upload.router");
const configrouter = require("./routers/config.router");
const authrouter = require("./routers/auth.router");
const vetrouter = require("./routers/vet.router");
const geoRestriction = require("./middleware/geo-restriction.middleware");
const { logger } = require("./utils/logger.util");

// Security Headers
app.use(helmet());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { status: 429, message: "Too many requests, please try again later." },
});
app.use(limiter);

// OCR-specific rate limiting (more restrictive for CPU-intensive operations)
const ocrLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Limit each IP to 10 OCR requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 429, message: "Too many OCR requests. Please try again later." },
  skipSuccessfulRequests: false,
});


const defaultOrigins = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3001",
];

// Merge default origins (for local dev) with environment-specified origins
// Check if config.cors exists, otherwise default to empty array
const configOrigins = config.cors && config.cors.origins ? config.cors.origins : [];
const effectiveOrigins = [...new Set([...defaultOrigins, ...configOrigins])];

app.use(
  cors({
    origin: (origin, callback) => {
      // Only allow no-origin requests in development (Postman, curl, etc.)
      if (!origin && config.isDev) {
        return callback(null, true);
      }

      // Allow all requests in development
      if (config.isDev) {
        return callback(null, true);
      }
      
      if (effectiveOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      return callback(new Error("Not allowed by CORS"));
    },
  })
);

// Geographic restriction (Israel only in production)
app.use(geoRestriction);
const bodyLimit = "10mb";

app.use(
  express.json({
    limit: bodyLimit,
    type: ["application/json", "text/plain"],
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: bodyLimit,
  })
);
app.use(dogsrouter);
app.use(showsrouter);
app.use(ocrrouter);
app.use("/visitordata", ocrLimiter); // Apply OCR rate limiter before visitor router
app.use(visitordatarouter);
app.use(brucellarouter);
app.use(managerrouter);
app.use(uploadrouter);
app.use(configrouter);
app.use(authrouter);
app.use(vetrouter);

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/", (req, res) => {
  res.redirect("/pages/index.html");
});

// Global Error Handler
app.use((err, req, res, next) => {
  // Handle operational errors (expected errors)
  if (err.isOperational) {
    logger.warn("Operational error", {
      error: err.message,
      statusCode: err.statusCode,
      path: req.path,
    });
    return res.status(err.statusCode).json({
      status: err.statusCode,
      message: err.message,
    });
  }

  // Handle unexpected errors (programmer errors)
  logger.error("Unhandled error", {
    error: err.message,
    stack: err.stack,
    path: req.path,
  });

  // Don't expose error details in production
  const message = config.isDev ? err.message : "Internal Server Error";

  res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
    status: HTTP_STATUS.INTERNAL_SERVER_ERROR,
    message,
  });
});

module.exports = app;
