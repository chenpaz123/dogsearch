const { addDogToShow } = require('./dogs');
const { GetHisunValid } = require('../utils/hisunvalid');
const { db } = require('../firebase/firebase');

jest.mock('../utils/hisunvalid');
jest.mock('../firebase/firebase');

describe('addDogToShow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle TypeError: Failed to fetch', async () => {
    // We want the code to throw this error inside the try block.
    const mockData = { AnimalDetails: [{ ChipNumber: '123', HisunDate: '01/01/2023' }] };
    GetHisunValid.mockReturnValue(true);
    db.collection.mockImplementation(() => {
      throw "TypeError: Failed to fetch";
    });

    const result = await addDogToShow({ data: mockData, Show: 'TestShow' });

    expect(result).toEqual({
      KalevetValid: true,
      brucelladate: undefined, // because doc wasn't fetched
      BrucellaValid: undefined, // because doc wasn't fetched
      message: 'אין חיבור לאינטרנט',
      status: 500,
    });
  });

  it('should handle TypeError: Cannot read properties of undefined (reading \'0\')', async () => {
    // This happens if data or data["AnimalDetails"] is undefined.
    // data["AnimalDetails"][0] will throw TypeError: Cannot read properties of undefined (reading '0')
    const mockData = {};

    const result = await addDogToShow({ data: mockData, Show: 'TestShow' });

    expect(result).toEqual({
      message: "מספר השבב שהזנת אינו קיים במערכת",
      status: 404,
    });
  });
});
