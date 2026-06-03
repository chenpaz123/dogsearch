jest.mock('tesseract.js', () => ({
  createWorker: jest.fn(() => ({
    load: jest.fn(),
    loadLanguage: jest.fn(),
    initialize: jest.fn(),
    setParameters: jest.fn(),
    recognize: jest.fn(),
    terminate: jest.fn(),
  })),
}));

const { extractResult } = require('./ocr');

describe('extractResult', () => {
  it('should return "negative" for english negative variations', () => {
    expect(extractResult('Negative')).toBe('negative');
    expect(extractResult('NEGATIVE')).toBe('negative');
    expect(extractResult('negative')).toBe('negative');
    expect(extractResult('test string with negative result')).toBe('negative');
  });

  it('should return "negative" for hebrew negative variation', () => {
    expect(extractResult('שלילי')).toBe('negative');
    expect(extractResult('תוצאה שלילי')).toBe('negative');
  });

  it('should return "positive" for english positive variations', () => {
    expect(extractResult('Positive')).toBe('positive');
    expect(extractResult('POSITIVE')).toBe('positive');
    expect(extractResult('positive')).toBe('positive');
    expect(extractResult('test string with positive result')).toBe('positive');
  });

  it('should return "positive" for hebrew positive variation', () => {
    expect(extractResult('חיובי')).toBe('positive');
    expect(extractResult('תוצאה חיובי')).toBe('positive');
  });

  it('should return "unknown" when neither positive nor negative keywords are found', () => {
    expect(extractResult('inconclusive')).toBe('unknown');
    expect(extractResult('test string')).toBe('unknown');
    expect(extractResult('')).toBe('unknown');
  });

  it('should return "negative" when both negative and positive keywords are present', () => {
    expect(extractResult('Negative and positive')).toBe('negative');
    expect(extractResult('חיובי ושלילי')).toBe('negative');
  });

  it('should throw TypeError when input is null or undefined', () => {
    expect(() => extractResult(null)).toThrow(TypeError);
    expect(() => extractResult(undefined)).toThrow(TypeError);
  });
});
