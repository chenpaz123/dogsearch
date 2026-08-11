const DEFAULT_TTL_MS = Number(process.env.CACHE_TTL_MS || 30_000);

const store = new Map();

const toKey = (segments) => {
  if (Array.isArray(segments)) {
    return segments.map((segment) => String(segment)).join("::");
  }
  return String(segments);
};

const withCache = async (segments, fetcher, options = {}) => {
  const key = toKey(segments);
  const ttlMs = Number.isFinite(options.ttlMs) ? options.ttlMs : DEFAULT_TTL_MS;
  const forceRefresh = options.forceRefresh === true;
  const now = Date.now();
  const existing = store.get(key);

  if (!forceRefresh && existing) {
    if (
      existing.expiresAt &&
      existing.expiresAt > now &&
      existing.value !== undefined
    ) {
      return existing.value;
    }
    if (existing.promise) {
      return existing.promise;
    }
  }

  const promise = Promise.resolve().then(fetcher);
  store.set(key, { promise });
  try {
    const value = await promise;
    store.set(key, { value, expiresAt: now + ttlMs });
    return value;
  } catch (error) {
    store.delete(key);
    throw error;
  }
};

const invalidateCache = (segments) => {
  const key = toKey(segments);
  store.delete(key);
};

const clearCache = () => {
  store.clear();
};

/**
 * Removes expired cache entries to prevent memory leaks.
 * This is automatically called periodically.
 */
const cleanupExpiredEntries = () => {
  const now = Date.now();
  const keysToDelete = [];

  for (const [key, entry] of store.entries()) {
    if (entry.expiresAt && entry.expiresAt < now) {
      keysToDelete.push(key);
    }
  }

  keysToDelete.forEach((key) => store.delete(key));

  if (keysToDelete.length > 0) {
    // Optional: log cleanup for monitoring
    // console.log(`Cleaned up ${keysToDelete.length} expired cache entries`);
  }
};

// Run cleanup every 5 minutes to prevent memory leaks
// Run cleanup every 5 minutes to prevent memory leaks
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
let cleanupInterval;

if (process.env.NODE_ENV !== "test") {
  cleanupInterval = setInterval(cleanupExpiredEntries, CLEANUP_INTERVAL_MS);
}

const stopCleanup = () => {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
  }
};

module.exports = {
  invalidateCache,
  clearCache,
  stopCleanup,
};
