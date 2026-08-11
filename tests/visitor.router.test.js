const express = require("express");
const request = require("supertest");

const mockGetVisitorData = jest.fn();

jest.mock("../src/controllers/visitor.controller", () => ({
  getvisitordata: (...args) => mockGetVisitorData(...args),
}));

const router = require("../src/routers/visitor.router");

const createApp = () => {
  const app = express();
  app.use(express.json());
  app.use(router);
  return app;
};

describe("visitor router", () => {
  beforeEach(() => {
    mockGetVisitorData.mockReset();
  });

  it("returns controller response with explicit status", async () => {
    mockGetVisitorData.mockResolvedValue({
      status: 201,
      message: "brucella is valid",
    });

    const app = createApp();
    const res = await request(app)
      .post("/visitordata")
      .send({ showdate: "2023-04-05", image: "img", chipnum: "123456789012345", show: "Test Show" });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("brucella is valid");
    expect(mockGetVisitorData).toHaveBeenCalledWith({
      showdate: "2023-04-05",
      image: "img",
      chipnum: "123456789012345",
      show: "Test Show",
    });
  });

  it("defaults status to 200 when controller omits it", async () => {
    mockGetVisitorData.mockResolvedValue({ status: 200, message: "ok" });

    const app = createApp();
    const res = await request(app)
      .post("/visitordata")
      .send({ showdate: "2023-04-05", image: "img" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("ok");
  });
});
