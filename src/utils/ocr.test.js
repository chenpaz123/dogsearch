const { ReadText } = require("./ocr");
const tesseract = require("tesseract.js");

// Mock tesseract.js
jest.mock("tesseract.js", () => {
  const mockWorker = {
    load: jest.fn().mockResolvedValue(),
    loadLanguage: jest.fn().mockResolvedValue(),
    initialize: jest.fn().mockResolvedValue(),
    setParameters: jest.fn().mockResolvedValue(),
    recognize: jest.fn(),
    terminate: jest.fn().mockResolvedValue(),
  };
  return {
    createWorker: jest.fn(() => mockWorker),
  };
});

describe("ocr module tests", () => {
  describe("ReadText", () => {
    let mockWorker;

    beforeEach(() => {
      jest.clearAllMocks();
      mockWorker = tesseract.createWorker();
    });

    it("should successfully extract text from an image", async () => {
      mockWorker.recognize.mockResolvedValue({
        data: { text: "mocked text output" },
      });

      const result = await ReadText("fake-image.jpg");

      expect(result).toBe("mocked text output");
      expect(mockWorker.load).toHaveBeenCalled();
      expect(mockWorker.loadLanguage).toHaveBeenCalledWith("eng+osd+heb");
      expect(mockWorker.initialize).toHaveBeenCalledWith("eng+osd+heb");
      expect(mockWorker.setParameters).toHaveBeenCalled();
      expect(mockWorker.recognize).toHaveBeenCalledWith("fake-image.jpg");
      expect(mockWorker.terminate).toHaveBeenCalled();
    });

    it("should handle error during text extraction and return the error message", async () => {
      const errorMessage = "Recognize failed";
      mockWorker.recognize.mockRejectedValue(new Error(errorMessage));

      const result = await ReadText("fake-image.jpg");

      expect(result).toBe(`An error occurred: Error: ${errorMessage}`);
      expect(mockWorker.load).toHaveBeenCalled();
      expect(mockWorker.recognize).toHaveBeenCalledWith("fake-image.jpg");
      expect(mockWorker.terminate).toHaveBeenCalled();
    });
  });
});
