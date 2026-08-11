const express = require("express");
const request = require("supertest");

const mockVerifyIdToken = jest.fn();
const mockSetShow = jest.fn();

jest.mock("firebase-admin", () => ({
  credential: { cert: jest.fn() },
  initializeApp: jest.fn(),
  firestore: jest.fn(() => ({ collection: jest.fn() })),
  auth: () => ({ verifyIdToken: mockVerifyIdToken }),
}));

jest.mock("../src/firebase/firebase", () => ({
  admin: require("firebase-admin"),
  db: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        set: mockSetShow,
      })),
    })),
  },
}));

const router = require("../src/routers/shows.router");

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use(router);
  return app;
};

describe("shows router security", () => {
  beforeEach(() => {
    mockVerifyIdToken.mockReset();
    mockVerifyIdToken.mockResolvedValue({ email: "admin@example.com" });
    mockSetShow.mockReset();
  });

  it("requires bearer token", async () => {
    const app = createApp();
    const res = await request(app).post("/addshow").send({ KenelClubName: "Show" });
    expect(res.status).toBe(401);
  });
});