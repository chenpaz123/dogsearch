const { getdatafrommoagdb } = require('./getdatafrommoagdb');

// Mock node-fetch
jest.mock('node-fetch', () => jest.fn());
const fetch = require('node-fetch');

describe('getdatafrommoagdb', () => {
  let consoleLogSpy;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Mock console.log to keep test output clean
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.log
    consoleLogSpy.mockRestore();
  });

  it('should successfully fetch animal details and return data', async () => {
    // Arrange
    const mockData = { id: 123, name: 'Buster', type: 'Dog' };
    const mockResponse = {
      json: jest.fn().mockResolvedValue(mockData)
    };
    fetch.mockResolvedValue(mockResponse);

    const chipNum = '123456789';
    const expectedUrl = "https://dogsearch.moag.gov.il/api/GetAnimalDetails";
    const expectedSendData = { SearchParam: chipNum, top: 10, skip: 0 };

    // Act
    const result = await getdatafrommoagdb(chipNum);

    // Assert
    expect(consoleLogSpy).toHaveBeenCalledWith(chipNum);
    expect(fetch).toHaveBeenCalledWith(expectedUrl, {
      method: "POST",
      body: JSON.stringify(expectedSendData),
      headers: {
        "Content-Type": "application/json",
      },
    });
    expect(mockResponse.json).toHaveBeenCalled();
    expect(consoleLogSpy).toHaveBeenCalledWith(mockData);
    expect(consoleLogSpy).toHaveBeenCalledWith(mockResponse);
    expect(result).toEqual(mockData);
  });

  it('should handle and log errors when fetch fails', async () => {
    // Arrange
    const chipNum = '987654321';
    const mockError = new Error('Network error');
    fetch.mockRejectedValue(mockError);

    // Act
    const result = await getdatafrommoagdb(chipNum);

    // Assert
    expect(fetch).toHaveBeenCalled();
    expect(consoleLogSpy).toHaveBeenCalledWith(mockError);
    expect(result).toBeUndefined();
  });

  it('should handle and log errors when json parsing fails', async () => {
    // Arrange
    const chipNum = '555555555';
    const mockError = new Error('Invalid JSON');
    const mockResponse = {
      json: jest.fn().mockRejectedValue(mockError)
    };
    fetch.mockResolvedValue(mockResponse);

    // Act
    const result = await getdatafrommoagdb(chipNum);

    // Assert
    expect(fetch).toHaveBeenCalled();
    expect(mockResponse.json).toHaveBeenCalled();
    expect(consoleLogSpy).toHaveBeenCalledWith(mockError);
    expect(result).toBeUndefined();
  });
});
