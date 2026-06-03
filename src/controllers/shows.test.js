const { addshow } = require("./shows");
const { db } = require("../firebase/firebase");
const moment = require("moment");

// Mock the firebase db
jest.mock("../firebase/firebase", () => {
  const setMock = jest.fn();
  const docMock = jest.fn(() => ({ set: setMock }));
  const collectionMock = jest.fn(() => ({ doc: docMock }));
  return {
    db: {
      collection: collectionMock,
    },
  };
});

// Mock moment
jest.mock("moment", () => {
  const momentMock = {
    format: jest.fn(() => "01.01.2023"),
  };
  return jest.fn(() => momentMock);
});

describe("addshow", () => {
  let originalConsoleLog;

  beforeAll(() => {
    // Suppress console.log during tests to avoid noise
    originalConsoleLog = console.log;
    console.log = jest.fn();
  });

  afterAll(() => {
    console.log = originalConsoleLog;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should add a show successfully and return status 201", async () => {
    // Access the mocked set function
    const setMock = db.collection().doc().set;
    setMock.mockResolvedValueOnce({});

    const result = await addshow({ KenelClubName: "TestClub" });

    // Verify moment was called
    expect(moment).toHaveBeenCalled();
    expect(moment().format).toHaveBeenCalledWith("DD.MM.YYYY");

    // Verify firebase db was called correctly
    expect(db.collection).toHaveBeenCalledWith("shows");
    expect(db.collection().doc).toHaveBeenCalledWith("TestClub - 01.01.2023");
    expect(setMock).toHaveBeenCalledWith({
      KenelClubName: "TestClub",
      ShowDate: "01.01.2023",
    });

    // Verify return value
    expect(result).toEqual({
      message: "Show added successfully",
      status: 201,
    });
  });

  it("should return status 400 when an error occurs while adding the show", async () => {
    // Access the mocked set function
    const setMock = db.collection().doc().set;
    const testError = new Error("Firebase error");
    setMock.mockRejectedValueOnce(testError);

    const result = await addshow({ KenelClubName: "ErrorClub" });

    // Verify console.log was called with the error
    expect(console.log).toHaveBeenCalledWith(testError);

    // Verify return value
    expect(result).toEqual({
      message: "Show not added",
      status: 400,
    });
  });
});
