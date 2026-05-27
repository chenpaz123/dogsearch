const { fixdatetodot } = require('./fixdate');

describe('fixdatetodot utility', () => {
  describe('Valid date formats', () => {
    it('should format DD/MM/YYYY to DD.MM.YYYY', () => {
      expect(fixdatetodot('15/08/2023')).toBe('15.08.2023');
    });

    it('should format DD.MM.YYYY to DD.MM.YYYY', () => {
      expect(fixdatetodot('15.08.2023')).toBe('15.08.2023');
    });

    it('should format DD-MM-YYYY to DD.MM.YYYY', () => {
      expect(fixdatetodot('15-08-2023')).toBe('15.08.2023');
    });

    it('should format YYYY-MM-DD to DD.MM.YYYY', () => {
      expect(fixdatetodot('2023-08-15')).toBe('15.08.2023');
    });

    it('should format DD/MM/YY to DD.MM.YYYY', () => {
      expect(fixdatetodot('15/08/23')).toBe('15.08.2023');
    });
  });

  describe('Edge cases and invalid inputs', () => {
    it('should return undefined for invalid date string', () => {
      expect(fixdatetodot('not-a-date')).toBeUndefined();
    });

    it('should return undefined for empty string', () => {
      expect(fixdatetodot('')).toBeUndefined();
    });

    it('should return undefined for null', () => {
      expect(fixdatetodot(null)).toBeUndefined();
    });

    it('should return undefined for undefined', () => {
      expect(fixdatetodot(undefined)).toBeUndefined();
    });

    it('should return undefined for invalid calendar dates (non-leap year)', () => {
      expect(fixdatetodot('29/02/2023')).toBeUndefined();
    });

    it('should return undefined for invalid calendar dates (out of bounds month/day)', () => {
      expect(fixdatetodot('32/01/2023')).toBeUndefined();
      expect(fixdatetodot('15/13/2023')).toBeUndefined();
    });
  });
});
