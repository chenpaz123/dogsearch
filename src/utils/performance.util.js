const { performance } = require("node:perf_hooks");
const { createLogger } = require("./logger.util");

const logger = createLogger("utils:perf");

const perfMarks = new Map();

const markStart = (label) => {
  perfMarks.set(label, performance.now());
};

const markEnd = (label) => {
  const start = perfMarks.get(label);
  if (typeof start !== "number") {
    return null;
  }
  const duration = performance.now() - start;
  perfMarks.delete(label);
  return { label, duration };
};

const logPerf = (result) => {
  if (!result) {
    return;
  }
  logger.debug("perf timing", {
    label: result.label,
    durationMs: Number(result.duration.toFixed(2)),
  });
};

module.exports = {
  markStart,
  markEnd,
  logPerf,
};
