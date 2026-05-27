const { extractChip } = require('./ocr');

jest.mock('tesseract.js', () => ({
  createWorker: jest.fn(() => ({
    load: jest.fn(),
    loadLanguage: jest.fn(),
    initialize: jest.fn(),
    setParameters: jest.fn(),
    recognize: jest.fn(),
    terminate: jest.fn()
  }))
}));

describe('extractChip', () => {
  it('should extract a single 15-digit chip number from text', () => {
    const text = "The chip number is 123456789012345.";
    const result = extractChip(text);
    expect(result).toEqual(['123456789012345']);
  });

  it('should extract multiple 15-digit chip numbers from text', () => {
    const text = "Chips: 123456789012345 and 987654321098765.";
    const result = extractChip(text);
    expect(result).toEqual(['123456789012345', '987654321098765']);
  });

  it('should return null if no 15-digit sequences are found', () => {
    const text = "This text has no 15-digit chip number. Only 14 digits: 12345678901234.";
    const result = extractChip(text);
    expect(result).toBeNull();
  });

  it('should match the first 15 digits of a longer sequence', () => {
    const text = "16 digits: 1234567890123456";
    const result = extractChip(text);
    expect(result).toEqual(['123456789012345']);
  });

  it('should handle empty strings and text without numbers', () => {
    const emptyText = "";
    const textWithoutNumbers = "Just some text here.";

    expect(extractChip(emptyText)).toBeNull();
    expect(extractChip(textWithoutNumbers)).toBeNull();
  });
});
