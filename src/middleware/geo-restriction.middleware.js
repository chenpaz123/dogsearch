const geoip = require("geoip-lite");
const { logger } = require("../utils/logger.util");
const config = require("../config");

/**
 * Middleware to restrict access to Israel only in production.
 * In development mode, this middleware does nothing.
 */
const geoRestriction = (req, res, next) => {
  // Skip geo-restriction in development mode
  if (config.isDev) {
    return next();
  }

  // Get IP address from request
  const ip = req.ip || req.connection.remoteAddress || req.socket.remoteAddress;
  
  // Handle localhost/private IPs (allow in production for testing)
  if (!ip || ip === "::1" || ip === "127.0.0.1" || ip.startsWith("192.168.") || ip.startsWith("10.")) {
    logger.warn(`Geo-restriction: Allowing private/localhost IP: ${ip}`);
    return next();
  }

  // Look up geolocation for IP
  const geo = geoip.lookup(ip);

  if (!geo) {
    logger.warn(`Geo-restriction: Unable to determine location for IP: ${ip}`);
    // Allow access if we can't determine location (fail open)
    return next();
  }

  // Check if country is Israel (IL)
  if (geo.country === "IL") {
    logger.info(`Geo-restriction: Allowed access from Israel, IP: ${ip}`);
    return next();
  }

  // Block access from non-Israel IPs
  logger.warn(`Geo-restriction: Blocked access from ${geo.country}, IP: ${ip}`);
  return res.status(403).json({
    error: "Access denied",
    message: "This application is only available in Israel"
  });
};

module.exports = geoRestriction;
