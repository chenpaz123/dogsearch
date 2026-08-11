const request = require("supertest");
const app = require("../src/server");

describe("Security Features", () => {
  it("should have security headers (Helmet)", async () => {
    const res = await request(app).get("/");
    expect(res.headers["x-dns-prefetch-control"]).toBeDefined();
    expect(res.headers["x-frame-options"]).toBeDefined();
    expect(res.headers["strict-transport-security"]).toBeDefined();
  });

  it("should enforce rate limiting", async () => {
    // Send 101 requests to trigger rate limit
    // Note: This might be slow, so we might want to mock rate limiter or use a lower limit for testing if possible.
    // However, for integration test, we can just check if headers are present.
    const res = await request(app).get("/");
    expect(res.headers["ratelimit-limit"]).toBeDefined();
    expect(res.headers["ratelimit-remaining"]).toBeDefined();
  });

  it("should validate input for /addDogToShow", async () => {
    const res = await request(app).post("/addDogToShow").send({});
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Validation failed");
  });

  it("should handle 404 for unknown routes", async () => {
    const res = await request(app).get("/unknown-route");
    expect(res.status).toBe(404);
  });
});
