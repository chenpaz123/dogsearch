jest.mock("../src/utils/ocr.util", () => ({
  extractDates: jest.fn(),
  extractChip: jest.fn(),
  extractResult: jest.fn(),
  ReadText: jest.fn(),
}));

const {
  extractDates,
  extractChip,
  extractResult,
  ReadText,
} = require("../src/utils/ocr.util");
const { ocr } = require("../src/controllers/ocr.controller");

describe("ocr controller", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it("returns data when OCR succeeds", async () => {
    ReadText.mockResolvedValue("text");
    extractDates.mockReturnValue(["01/01/2024"]);
    extractChip.mockReturnValue(["123"]);
    extractResult.mockReturnValue("negative");

    const response = await ocr("image");
    expect(response.status).toBe(200);
    expect(response.chip).toBe("123");
  });

  it("handles read errors as 500", async () => {
    ReadText.mockRejectedValue(new Error("worker exploded"));
    const response = await ocr("image");
    expect(response.status).toBe(500);
    expect(response.message).toMatch(/ocr processing failed|worker exploded/i);
  });

  it("handles image validation errors as 400", async () => {
    const error = new Error("image path is outside of uploads directory");
    ReadText.mockRejectedValue(error);
    const response = await ocr("image");
    expect(response.status).toBe(400);
  });

  it("returns 400 when no chip found", async () => {
    ReadText.mockResolvedValue("text");
    extractDates.mockReturnValue(["01/01/2024"]);
    extractChip.mockReturnValue([]);
    extractResult.mockReturnValue("negative");

    const response = await ocr("image");
    expect(response.status).toBe(400);
  });

  it("returns 407 when result not negative", async () => {
    ReadText.mockResolvedValue("text");
    extractDates.mockReturnValue(["01/01/2024"]);
    extractChip.mockReturnValue(["123"]);
    extractResult.mockReturnValue("positive");

    const response = await ocr("image");
    expect(response.status).toBe(422);
  });
});
