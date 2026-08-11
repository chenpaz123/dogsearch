const fs = require("fs");
const path = require("path");
const express = require("express");
const request = require("supertest");

const uploadsDir = path.join(__dirname, "..", "uploads");
const BASE64_PNG = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/wIAAgMBApX7q1cAAAAASUVORK5CYII=";

const createApp = () => {
  delete require.cache[require.resolve("../src/routers/upload.router")];
  const uploadRouter = require("../src/routers/upload.router");
  const app = express();
  app.use(uploadRouter);
  return app;
};

describe("upload router", () => {
  afterEach(() => {
    if (fs.existsSync(uploadsDir)) {
      fs.readdirSync(uploadsDir).forEach((file) => {
        fs.unlinkSync(path.join(uploadsDir, file));
      });
    }
  });

  it("accepts valid image uploads", async () => {
    const app = createApp();
    const res = await request(app)
      .post("/upload/image")
      .attach("image", Buffer.from(BASE64_PNG, "base64"), {
        filename: "sample.png",
        contentType: "image/png",
      });

    if (res.status !== 201) {
      console.log("upload files after failure", fs.existsSync(uploadsDir) ? fs.readdirSync(uploadsDir) : []);
    }
    expect(res.status).toBe(201);
    expect(res.body.path).toMatch(/^uploads\//);
    const storedPath = path.join(__dirname, "..", res.body.path.replace(/^\//, ""));
    expect(fs.existsSync(storedPath)).toBe(true);
  });

  it("rejects unsupported file types", async () => {
    const app = createApp();
    const res = await request(app)
      .post("/upload/image")
      .attach("image", Buffer.from("hello"), {
        filename: "note.txt",
        contentType: "text/plain",
      });

    expect(res.status).toBe(500);
  });

  it("requires a file", async () => {
    const app = createApp();
    const res = await request(app).post("/upload/image");
    expect(res.status).toBe(400);
  });
});


