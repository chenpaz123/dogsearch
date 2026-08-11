const express = require("express");
const request = require("supertest");

const mockVerifyIdToken = jest.fn();
const mockSet = jest.fn();

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
        collection: jest.fn(() => ({
          doc: jest.fn(() => ({
            set: mockSet,
            get: jest.fn().mockResolvedValue({ exists: false }),
          })),
        })),
      })),
    })),
  },
}));

const router = require("../src/routers/brucella.router");

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use(router);
  return app;
};

describe("brucella router security", () => {
  beforeEach(() => {
    mockVerifyIdToken.mockReset();
    mockVerifyIdToken.mockResolvedValue({ email: "admin@example.com" });
    mockSet.mockReset();
    mockSet.mockResolvedValue(undefined);
  });

  it("requires bearer token", async () => {
    const app = createApp();
    const res = await request(app).post("/brucellafirestore").send({});
    expect(res.status).toBe(401);
  });
});

describe("brucella router contract", () => {
  beforeEach(() => {
    mockVerifyIdToken.mockReset();
    mockVerifyIdToken.mockResolvedValue({ email: "admin@example.com" });
    mockSet.mockReset();
    mockSet.mockResolvedValue(undefined);
  });

  it("stores brucella data and returns controller response", async () => {
    const app = createApp();
    const res = await request(app)
      .post("/brucellafirestore")
      .set("Authorization", "Bearer token")
      .send({ chip: "123456789012345", show: "Show - 01.01.2023", brucella: "01/01/2023" });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("brucella added successfully");
    expect(mockSet).toHaveBeenCalledWith({ brucella: "01/01/2023" }, { merge: true });
  });
});
