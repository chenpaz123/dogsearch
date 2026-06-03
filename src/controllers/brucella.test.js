const { brucellafiresotre } = require("./brucella");
const { db } = require("../firebase/firebase");

// Mock the Firebase db
jest.mock("../firebase/firebase", () => {
  const setMock = jest.fn();
  const docMock2 = jest.fn(() => ({ set: setMock }));
  const collectionMock2 = jest.fn(() => ({ doc: docMock2 }));
  const docMock1 = jest.fn(() => ({ collection: collectionMock2 }));
  const collectionMock1 = jest.fn(() => ({ doc: docMock1 }));

  return {
    db: {
      collection: collectionMock1,
    },
    // Export mocks for assertions
    _setMock: setMock,
    _docMock2: docMock2,
    _collectionMock2: collectionMock2,
    _docMock1: docMock1,
    _collectionMock1: collectionMock1,
  };
});

describe("brucellafiresotre", () => {
  let consoleLogSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  it("should successfully add a brucella test date and return status 201", async () => {
    const show = "Test Show 2023";
    const chipnum = "123456789";
    const date = "01.01.2023";

    const { _setMock, _collectionMock1, _docMock1, _collectionMock2, _docMock2 } = require("../firebase/firebase");
    _setMock.mockResolvedValueOnce();

    const result = await brucellafiresotre(show, chipnum, date);

    expect(_collectionMock1).toHaveBeenCalledWith("shows");
    expect(_docMock1).toHaveBeenCalledWith(show);
    expect(_collectionMock2).toHaveBeenCalledWith("dogs");
    expect(_docMock2).toHaveBeenCalledWith(String(chipnum));
    expect(_setMock).toHaveBeenCalledWith({ brucella: date });

    expect(result).toEqual({
      message: "brucella added successfully",
      status: 201,
    });
    expect(consoleLogSpy).not.toHaveBeenCalled();
  });

  it("should return status 400 when an error occurs during database operation", async () => {
    const show = "Test Show 2023";
    const chipnum = "123456789";
    const date = "01.01.2023";
    const error = new Error("Firebase failure");

    const { _setMock } = require("../firebase/firebase");
    _setMock.mockRejectedValueOnce(error);

    const result = await brucellafiresotre(show, chipnum, date);

    expect(_setMock).toHaveBeenCalledWith({ brucella: date });

    expect(consoleLogSpy).toHaveBeenCalledWith(error);
    expect(result).toEqual({
      message: "brucella not added",
      status: 400,
    });
  });
});
