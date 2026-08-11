const { __mockAuth: adminAuthMock } = require("firebase-admin");
const { __getLoggers } = require("../src/utils/logger.util");
const middleware = require("../src/middleware/auth.middleware");

jest.mock("../src/firebase/firebase", () => ({
  admin: require("firebase-admin"),
  db: { collection: jest.fn() },
}));

describe("requireFirebaseAuth middleware", () => {
  let logger;

  const runMiddleware = (req) =>
    new Promise((resolve) => {
      const res = {
        status(code) {
          this.statusCode = code;
          return this;
        },
        json(payload) {
          resolve({ statusCode: this.statusCode, payload });
        },
      };

      middleware(req, res, () => resolve({ statusCode: 200 }));
    });

  beforeEach(() => {
    process.env.ALLOWED_MANAGER_EMAILS = "admin@example.com";
    adminAuthMock.verifyIdToken.mockReset();
    adminAuthMock.verifyIdToken.mockResolvedValue({
      email: "admin@example.com",
    });

    logger = __getLoggers().find((entry) => entry.__namespace === "middleware:requireFirebaseAuth");
    if (!logger) {
      throw new Error("middleware logger not initialised");
    }
    ["error", "warn", "info", "debug"].forEach((method) => {
      logger[method].mockClear();
    });
  });

  it("rejects missing bearer token", async () => {
    const result = await runMiddleware({ headers: {} });
    expect(result.statusCode).toBe(401);
    expect(result.payload.message).toMatch(/missing bearer token/);
  });

  it("rejects invalid token", async () => {
    adminAuthMock.verifyIdToken.mockRejectedValue(new Error("bad token"));
    const result = await runMiddleware({
      headers: { authorization: "Bearer invalid" },
    });
    expect(result.statusCode).toBe(401);
    expect(result.payload.message).toMatch(/invalid authentication token/);
    expect(logger.error).toHaveBeenCalled();
  });

  it("rejects user not in allow list", async () => {
    adminAuthMock.verifyIdToken.mockResolvedValue({
      email: "other@example.com",
    });
    const result = await runMiddleware({
      headers: { authorization: "Bearer token" },
    });
    expect(result.statusCode).toBe(403);
    expect(result.payload.message).toMatch(/unauthorised user/);
  });

  it("passes for authorised user", async () => {
    const result = await runMiddleware({
      headers: { authorization: "Bearer valid" },
    });
    expect(result.statusCode).toBe(200);
    expect(logger.error).not.toHaveBeenCalled();
  });
});
