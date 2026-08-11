let firebaseConfigPromise;

const normaliseBase = (value) => {
  if (typeof value !== "string") {
    return undefined;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  return trimmed.replace(/\/$/, "");
};

const resolveApiBase = () => {
  if (typeof window === "undefined") {
    return "http://localhost:3000";
  }

  const override = normaliseBase(window.__APP_API_BASE__);
  if (override) {
    return override;
  }

  try {
    const origin = normaliseBase(window.location.origin);
    if (origin) {
      // If running on localhost but not port 3000 (e.g. Live Preview on 3001),
      // force API calls to go to the backend on port 3000.
      if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
        return "http://localhost:3000";
      }
      return origin;
    }
  } catch (error) {
    // fall through to default
  }

  return "http://localhost:3000";
};

const apiBase = resolveApiBase();

const fetchFirebaseConfig = async () => {
  const response = await fetch(`${apiBase}/config/firebase`, {
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Failed to load Firebase config (${response.status}): ${text}`
    );
  }

  const payload = await response.json();
  if (!payload || typeof payload !== "object" || !payload.config) {
    throw new Error("Firebase config response missing 'config' field");
  }

  return payload.config;
};

export const loadFirebaseConfig = async () => {
  if (!firebaseConfigPromise) {
    firebaseConfigPromise = fetchFirebaseConfig();
  }
  return firebaseConfigPromise;
};
export const getApiBase = () => apiBase;
