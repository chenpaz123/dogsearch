require("dotenv").config();
const app = require("./server");
const { logger } = require("./utils/logger.util");

if (!process.env.FIREBASE_API_KEY) {
  logger.warn("FIREBASE_API_KEY is missing from environment variables!");
} else {
  logger.info("FIREBASE_API_KEY is loaded.");
}

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`server is running on port ${PORT}`);
  logger.info(`http://localhost:${PORT}`);
});
