jest.mock("tesseract.js", () => ({
  createWorker: jest.fn(() => ({
    load: jest.fn(),
    loadLanguage: jest.fn(),
    initialize: jest.fn(),
    setParameters: jest.fn(),
    recognize: jest.fn(),
    terminate: jest.fn()
  }))
}));

const { extractDates } = require("./ocr");

describe("extractDates", () => {
  it("should extract a single date formatted with slashes", () => {
    const text = "The date is 12/05/2023.";
    expect(extractDates(text)).toEqual(["12/05/2023"]);
  });

  it("should extract a single date formatted with dots", () => {
    const text = "The date is 12.05.2023.";
    expect(extractDates(text)).toEqual(["12.05.2023"]);
  });

  it("should extract dates with single-digit days and months", () => {
    const text = "The dates are 1/5/2023 and 2.6.2023.";
    expect(extractDates(text)).toEqual(["1/5/2023", "2.6.2023"]);
  });

  it("should extract multiple dates from a single string", () => {
    const text = "Dates: 12/05/2023, 13/05/2023, 14.05.2023.";
    expect(extractDates(text)).toEqual(["12/05/2023", "13/05/2023", "14.05.2023"]);
  });

  it("should return null when there are no dates in the text", () => {
    const text = "There are no dates here.";
    expect(extractDates(text)).toBeNull();
  });
});
