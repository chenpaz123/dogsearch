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

const { extractDates } = require('./ocr');

describe('ocr utility - extractDates', () => {
  describe('Valid date formats', () => {
    it('should extract dates in dd/mm/yyyy format', () => {
      expect(extractDates('The date is 15/08/2023.')).toEqual(['15/08/2023']);
    });

    it('should extract dates in dd.mm.yyyy format', () => {
      expect(extractDates('The date is 15.08.2023.')).toEqual(['15.08.2023']);
    });

    it('should extract dates with single digit days and months (d/m/yyyy)', () => {
      expect(extractDates('Event on 5/8/2023.')).toEqual(['5/8/2023']);
    });

    it('should extract dates with single digit days and months (d.m.yyyy)', () => {
      expect(extractDates('Event on 5.8.2023.')).toEqual(['5.8.2023']);
    });

    it('should extract multiple dates from the text', () => {
      const text = 'Start date: 01/01/2023, End date: 31.12.2023.';
      expect(extractDates(text)).toEqual(['01/01/2023', '31.12.2023']);
    });
  });

  describe('Edge cases and no matches', () => {
    it('should return null if no dates are found', () => {
      expect(extractDates('This text contains no dates.')).toBeNull();
    });

    it('should return null for empty string', () => {
      expect(extractDates('')).toBeNull();
    });

    it('should not extract partial dates or invalid formats', () => {
      const text = 'Not a date 15/08/23 or 2023/08/15.';
      expect(extractDates(text)).toBeNull();
    });
  });
});
