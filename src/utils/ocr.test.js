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

const { extractResult } = require('./ocr');

describe('extractResult', () => {
  describe('Positive matches', () => {
    it('should return "positive" for "Positive"', () => {
      expect(extractResult('The result is Positive.')).toBe('positive');
    });

    it('should return "positive" for "POSITIVE"', () => {
      expect(extractResult('The result is POSITIVE.')).toBe('positive');
    });

    it('should return "positive" for "positive"', () => {
      expect(extractResult('The result is positive.')).toBe('positive');
    });

    it('should return "positive" for "חיובי"', () => {
      expect(extractResult('התוצאה היא חיובי')).toBe('positive');
    });
  });

  describe('Negative matches', () => {
    it('should return "negative" for "Negative"', () => {
      expect(extractResult('The result is Negative.')).toBe('negative');
    });

    it('should return "negative" for "NEGATIVE"', () => {
      expect(extractResult('The result is NEGATIVE.')).toBe('negative');
    });

    it('should return "negative" for "negative"', () => {
      expect(extractResult('The result is negative.')).toBe('negative');
    });

    it('should return "negative" for "שלילי"', () => {
      expect(extractResult('התוצאה היא שלילי')).toBe('negative');
    });
  });

  describe('Edge cases', () => {
    it('should return "unknown" when there are no matches', () => {
      expect(extractResult('The result is inconclusive.')).toBe('unknown');
    });

    it('should return "negative" when both positive and negative keywords are present', () => {
      // The function currently checks for negative first and returns it if found
      expect(extractResult('The result is positive but also negative.')).toBe('negative');
    });

    it('should return "unknown" when input is null', () => {
      expect(extractResult(null)).toBe('unknown');
    });

    it('should return "unknown" when input is undefined', () => {
      expect(extractResult(undefined)).toBe('unknown');
    });

    it('should return "unknown" when input is a number', () => {
      expect(extractResult(123)).toBe('unknown');
    });

    it('should return "unknown" when input is an object', () => {
      expect(extractResult({})).toBe('unknown');
    });
  });
});
