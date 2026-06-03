const { ocr } = require('./ocr');
const { extractDates, extractChip, extractResult, ReadText } = require('../utils/ocr');

jest.mock('../utils/ocr', () => ({
  extractDates: jest.fn(),
  extractChip: jest.fn(),
  extractResult: jest.fn(),
  ReadText: jest.fn(),
}));

describe('ocr controller', () => {
  const dummyImage = 'dummy-image';

  beforeEach(() => {
    jest.clearAllMocks();
    ReadText.mockResolvedValue('dummy-text');
  });

  test('returns 400 when no chip and no date are found', async () => {
    extractDates.mockReturnValue(null);
    extractChip.mockReturnValue(null);
    extractResult.mockReturnValue('unknown');

    const result = await ocr(dummyImage);

    expect(result).toEqual({
      status: 400,
      message: 'no chip number or date',
    });
  });

  test('returns 403 when chip is found but date is missing', async () => {
    extractDates.mockReturnValue(null);
    extractChip.mockReturnValue(['123456789012345']);
    extractResult.mockReturnValue('unknown');

    const result = await ocr(dummyImage);

    expect(result).toEqual({
      status: 403,
      message: 'no date found',
      chip: '123456789012345',
    });
  });

  test('returns 401 when date is found but chip is missing', async () => {
    extractDates.mockReturnValue(['01/01/2023']);
    extractChip.mockReturnValue(null);
    extractResult.mockReturnValue('unknown');

    const result = await ocr(dummyImage);

    expect(result).toEqual({
      status: 401,
      message: 'no chip found',
      date: '01/01/2023',
    });
  });

  test('returns 407 when the test result is not negative', async () => {
    extractDates.mockReturnValue(['01/01/2023']);
    extractChip.mockReturnValue(['123456789012345']);
    extractResult.mockReturnValue('positive');

    const result = await ocr(dummyImage);

    expect(result).toEqual({
      status: 407,
      message: 'הבדיקה לא שלילית',
      date: '01/01/2023',
      chip: '123456789012345',
      result: false,
    });
  });

  test('returns 200 with extracted date, chip, and result when all are correct', async () => {
    extractDates.mockReturnValue(['01/01/2023']);
    extractChip.mockReturnValue(['123456789012345']);
    extractResult.mockReturnValue('negative');

    const result = await ocr(dummyImage);

    expect(result).toEqual({
      status: 200,
      message: 'OCR done',
      date: '01/01/2023',
      chip: '123456789012345',
      result: true,
    });
  });
});
