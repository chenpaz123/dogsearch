jest.mock('tesseract.js', () => ({
  createWorker: jest.fn(() => ({
    load: jest.fn(),
    loadLanguage: jest.fn(),
    initialize: jest.fn(),
    setParameters: jest.fn(),
    recognize: jest.fn(() => Promise.resolve({ data: { text: '' } })),
    terminate: jest.fn(),
  })),
}));

const { extractChip } = require('./ocr');

describe('extractChip', () => {
  it('should extract a single 15-digit chip number', () => {
    const text = 'The chip number is 123456789012345.';
    const result = extractChip(text);
    expect(result).toEqual(['123456789012345']);
  });

  it('should extract multiple 15-digit chip numbers', () => {
    const text = 'Here are two chips: 123456789012345 and 987654321098765.';
    const result = extractChip(text);
    expect(result).toEqual(['123456789012345', '987654321098765']);
  });

  it('should return null when no 15-digit numbers are present', () => {
    const text = 'This text has no chip numbers.';
    const result = extractChip(text);
    expect(result).toBeNull();
  });

  it('should not extract numbers with fewer than 15 digits', () => {
    const text = 'This is a 14-digit number: 12345678901234.';
    const result = extractChip(text);
    expect(result).toBeNull();
  });

  it('should extract the first 15 digits of a longer number', () => {
    // Note: The current regex /(\d{15})/g extracts the first 15 digits
    // if it finds a contiguous block of digits.
    const text = 'This is a 16-digit number: 1234567890123456.';
    const result = extractChip(text);
    expect(result).toEqual(['123456789012345']);
  });

  it('should handle strings with mixed content and Hebrew characters', () => {
    const text = 'מספר השבב הוא 123456789012345.';
    const result = extractChip(text);
    expect(result).toEqual(['123456789012345']);
  });
});
