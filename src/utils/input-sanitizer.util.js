/**
 * Input Sanitization Utility
 *
 * Provides XSS protection and input sanitization for user-generated content.
 */

/**
 * Sanitizes HTML to prevent XSS attacks.
 * Removes potentially dangerous HTML tags and attributes.
 *
 * @param {string} input - Raw HTML input
 * @returns {string} Sanitized HTML
 */
const sanitizeHtml = (input) => {
  if (!input || typeof input !== "string") {
    return "";
  }

  // Remove script tags and their content
  let sanitized = input.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    ""
  );

  // Remove event handlers (onclick, onerror, etc.)
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, "");
  sanitized = sanitized.replace(/on\w+\s*=\s*[^\s>]*/gi, "");

  // Remove javascript: protocol
  sanitized = sanitized.replace(/javascript:/gi, "");

  // Remove data: protocol (can be used for XSS)
  sanitized = sanitized.replace(/data:text\/html/gi, "");

  // Remove iframe tags
  sanitized = sanitized.replace(
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    ""
  );

  // Remove object and embed tags
  sanitized = sanitized.replace(
    /<(object|embed)\b[^<]*(?:(?!<\/\1>)<[^<]*)*<\/\1>/gi,
    ""
  );

  return sanitized.trim();
};

/**
 * Sanitizes plain text input.
 * Escapes HTML special characters to prevent XSS.
 *
 * @param {string} input - Raw text input
 * @returns {string} Sanitized text with HTML entities escaped
 */
const sanitizeText = (input) => {
  if (!input || typeof input !== "string") {
    return "";
  }

  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
};

/**
 * Sanitizes a string for safe display without HTML.
 * Removes all HTML tags and escapes special characters.
 *
 * @param {string} input - Raw input
 * @returns {string} Plain text with no HTML
 */
const stripHtml = (input) => {
  if (!input || typeof input !== "string") {
    return "";
  }

  // Remove all HTML tags
  const stripped = input.replace(/<[^>]*>/g, "");

  // Decode HTML entities
  const decoded = stripped
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/");

  return decoded.trim();
};

/**
 * Validates and sanitizes a URL.
 * Only allows http, https, and mailto protocols.
 *
 * @param {string} url - URL to validate
 * @returns {string|null} Sanitized URL or null if invalid
 */
const sanitizeUrl = (url) => {
  if (!url || typeof url !== "string") {
    return null;
  }

  const trimmedUrl = url.trim();

  // Check for allowed protocols
  const allowedProtocols = ["http:", "https:", "mailto:"];

  try {
    const urlObj = new URL(trimmedUrl);
    if (!allowedProtocols.includes(urlObj.protocol)) {
      return null;
    }
    return urlObj.href;
  } catch (error) {
    // Not a valid URL
    return null;
  }
};

/**
 * Sanitizes an object's string properties.
 *
 * @param {Object} obj - Object to sanitize
 * @param {string[]} fields - Fields to sanitize
 * @param {string} mode - Sanitization mode: 'text' or 'html'
 * @returns {Object} Object with sanitized fields
 */
const sanitizeObject = (obj, fields, mode = "text") => {
  if (!obj || typeof obj !== "object") {
    return {};
  }

  const sanitized = { ...obj };
  const sanitizeFn = mode === "html" ? sanitizeHtml : sanitizeText;

  fields.forEach((field) => {
    if (sanitized[field] && typeof sanitized[field] === "string") {
      sanitized[field] = sanitizeFn(sanitized[field]);
    }
  });

  return sanitized;
};

module.exports = {
  sanitizeHtml,
  sanitizeText,
  stripHtml,
  sanitizeUrl,
  sanitizeObject,
};
