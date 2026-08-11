const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { markStart, markEnd, logPerf } = require("../utils/performance.util");

const router = express.Router();

const uploadsDir = path.join(__dirname, "..", "..", "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase() || ".jpg";
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const allowedExtensions = [".jpg", ".jpeg", ".png", ".heic", ".heif", ".webp"];
const allowedMimeTypes = [
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif",
  "image/webp",
];

const upload = multer({
  storage,
  limits: {
    fileSize: 8 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const mime = (file.mimetype || "").toLowerCase();
    if (allowedExtensions.includes(ext) && allowedMimeTypes.includes(mime)) {
      cb(null, true);
    } else {
      cb(new Error("unsupported file type"));
    }
  },
});

router.post("/upload/image", upload.single("image"), (req, res) => {
  markStart("upload:image");
  if (!req.file) {
    logPerf(markEnd("upload:image"));
    return res.status(400).send({
      status: 400,
      message: "no file uploaded",
    });
  }

  const safeFilename = path.basename(req.file.filename || "");
  const safeRelativePath = `uploads/${safeFilename}`;

  const perfResult = markEnd("upload:image");
  logPerf(perfResult);
  return res.status(201).send({
    status: 201,
    message: "image uploaded successfully",
    path: safeRelativePath,
  });
});

module.exports = router;