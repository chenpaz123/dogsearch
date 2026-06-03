const { getvisitordata } = require('../../../src/controllers/visitor');
const { ocr } = require('../../../src/controllers/ocr');
const { GetBrucellaValid } = require('../../../src/utils/hisunvalid');
const { fixdate } = require('../../../src/utils/fixdate');

// Mock tesseract.js first!
jest.mock('tesseract.js', () => {
    return {
        createWorker: jest.fn().mockResolvedValue({
            load: jest.fn(),
            loadLanguage: jest.fn(),
            initialize: jest.fn(),
            setParameters: jest.fn(),
            recognize: jest.fn(),
            terminate: jest.fn(),
        })
    }
});

// Mock the dependencies
jest.mock('../../../src/controllers/ocr');
jest.mock('../../../src/utils/hisunvalid');
jest.mock('../../../src/utils/fixdate');

describe('Visitor Controller - getvisitordata', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should return status 405 if image is undefined', async () => {
    const result = await getvisitordata({ showdate: '2023-01-01', image: undefined, chipnum: '12345' });

    expect(result).toEqual({
      status: 405,
      message: 'אין תמונה',
    });
    // ocr should not be called
    expect(ocr).not.toHaveBeenCalled();
  });

  it('should return status 406 if chip number does not match', async () => {
    ocr.mockResolvedValue({ date: '01/01/2023', chip: '54321', result: true });

    const result = await getvisitordata({ showdate: '2023-01-01', image: 'test_image.jpg', chipnum: '12345' });

    expect(result).toEqual({
      status: 406,
      message: 'מספר שבב לא תואם',
    });
    expect(ocr).toHaveBeenCalledWith('test_image.jpg');
  });

  it('should return status 400 if Brucella result is not negative (false) and ReferenceError occurs', async () => {
    ocr.mockResolvedValue({ date: '01/01/2023', chip: '12345', result: false });

    const result = await getvisitordata({ showdate: '2023-01-01', image: 'test_image.jpg', chipnum: '12345' });

    expect(result).toEqual({
      status: 400,
      message: 'brucella not added',
    });
  });

  it('should return status 401 if chip is undefined', async () => {
    ocr.mockResolvedValue({ date: '01/01/2023', chip: undefined, result: true });
    fixdate.mockReturnValue('01.01.2023');
    GetBrucellaValid.mockReturnValue(true);

    const result = await getvisitordata({ showdate: '2023-01-01', image: 'test_image.jpg', chipnum: undefined });

    expect(result).toEqual({
      status: 401,
      message: 'אין מספר שבב',
      date: '01.01.2023',
    });
  });

  it('should return status 402 if Brucella is not valid', async () => {
    ocr.mockResolvedValue({ date: '01/01/2023', chip: '12345', result: true });
    fixdate.mockReturnValue('01.01.2023');
    GetBrucellaValid.mockReturnValue(false);

    const result = await getvisitordata({ showdate: '2023-01-01', image: 'test_image.jpg', chipnum: '12345' });

    expect(result).toEqual({
      status: 402,
      message: 'ברוצלה לא בתוקף',
      chip: '12345',
      date: '01.01.2023',
    });
  });

  it('should return status 403 if Brucella date is undefined', async () => {
    ocr.mockResolvedValue({ date: undefined, chip: '12345', result: true });
    fixdate.mockReturnValue(undefined);
    GetBrucellaValid.mockReturnValue(true);

    const result = await getvisitordata({ showdate: '2023-01-01', image: 'test_image.jpg', chipnum: '12345' });

    expect(result).toEqual({
      status: 403,
      message: 'אין תאריך ברוצלה',
      chip: '12345',
    });
  });

  it('should return status 201 if Brucella is valid and all data is present', async () => {
    ocr.mockResolvedValue({ date: '01/01/2023', chip: '12345', result: true });
    fixdate.mockReturnValue('01.01.2023');
    GetBrucellaValid.mockReturnValue(true);

    const result = await getvisitordata({ showdate: '2023-01-01', image: 'test_image.jpg', chipnum: '12345' });

    expect(result).toEqual({
      status: 201,
      message: 'brucella is valid',
      chip: '12345',
      date: '01.01.2023',
      result: true,
    });
  });

  it('should return status 400 if an error is thrown during processing', async () => {
    // Simulate an error from OCR
    ocr.mockRejectedValue(new Error('OCR failed'));

    const result = await getvisitordata({ showdate: '2023-01-01', image: 'test_image.jpg', chipnum: '12345' });

    expect(result).toEqual({
      status: 400,
      message: 'brucella not added',
    });
  });
});
