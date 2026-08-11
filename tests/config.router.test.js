const express = require("express");
const request = require("supertest");

const createAppWithRouter = () => {
  delete require.cache[require.resolve("../src/routers/config.router")];
  const router = require("../src/routers/config.router");
  const app = express();
  app.use(router);
  return app;
};

describe("/config/firebase", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("returns config when required values are present", async () => {
    process.env.FIREBASE_API_KEY = "key";
    process.env.FIREBASE_AUTH_DOMAIN = "domain";
    process.env.FIREBASE_PROJECT_ID = "project";
    process.env.FIREBASE_DATABASE_URL = "https://example.com";

    const app = createAppWithRouter();
    const res = await request(app).get("/config/firebase");

    expect(res.status).toBe(200);
    expect(res.body.config).toMatchObject({
      apiKey: "key",
      authDomain: "domain",
      projectId: "project",
    });
  });

  it("fails when required values are missing", async () => {
    delete process.env.FIREBASE_API_KEY;
    process.env.FIREBASE_AUTH_DOMAIN = "domain";
    process.env.FIREBASE_PROJECT_ID = "project";

    const app = createAppWithRouter();
    const res = await request(app).get("/config/firebase");

    expect(res.status).toBe(500);
    expect(res.body.message).toMatch(/Missing Firebase configuration/);
  });
});