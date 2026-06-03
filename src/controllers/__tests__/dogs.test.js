const { addDogToShow } = require("../dogs");
const { GetHisunValid } = require("../../utils/hisunvalid");
const { db } = require("../../firebase/firebase");

// Mock dependencies
jest.mock("../../utils/hisunvalid", () => ({
  GetHisunValid: jest.fn(),
}));

jest.mock("../../firebase/firebase", () => {
  const mockDoc = {
    get: jest.fn(),
    update: jest.fn(),
  };
  const mockCollection = {
    doc: jest.fn(() => mockDoc),
  };
  const db = {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        collection: jest.fn(() => mockCollection)
      }))
    })),
  };
  return { db, mockDoc, mockCollection };
});

describe("addDogToShow", () => {
  let mockDoc;
  let mockCollection;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDoc = require("../../firebase/firebase").mockDoc;
    mockCollection = require("../../firebase/firebase").mockCollection;
  });

  it("should add dog to show if Kalevet is valid and doc exists", async () => {
    GetHisunValid.mockReturnValue(true);
    const mockDog = { ChipNumber: "123", HisunDate: "01/01/2023" };
    const mockData = { AnimalDetails: [mockDog] };
    const mockShow = "show1";

    mockDoc.get.mockResolvedValue({
      exists: true,
      data: () => ({ brucella: "01/01/2022" }),
    });

    const result = await addDogToShow({ data: mockData, Show: mockShow });

    expect(GetHisunValid).toHaveBeenCalledWith("01/01/2023");
    expect(mockDoc.get).toHaveBeenCalled();
    expect(mockDoc.update).toHaveBeenCalledWith(mockDog);
    expect(result).toEqual({
      dog: mockDog,
      KalevetValid: true,
      brucelladate: "01/01/2022",
      BrucellaValid: true,
      status: 201,
      message: "dog added to the show",
    });
  });

  it("should return 400 if Kalevet is invalid or doc doesn't exist", async () => {
    GetHisunValid.mockReturnValue(false);
    const mockDog = { ChipNumber: "123", HisunDate: "01/01/2020" };
    const mockData = { AnimalDetails: [mockDog] };
    const mockShow = "show1";

    mockDoc.get.mockResolvedValue({
      exists: false,
    });

    const result = await addDogToShow({ data: mockData, Show: mockShow });

    expect(GetHisunValid).toHaveBeenCalledWith("01/01/2020");
    expect(mockDoc.get).toHaveBeenCalled();
    expect(mockDoc.update).not.toHaveBeenCalled();
    expect(result).toEqual({
      dog: mockDog,
      KalevetValid: false,
      BrucellaValid: false,
      status: 400,
      message: "can't add dog to the show",
    });
  });

  it("should return 500 for network error", async () => {
    GetHisunValid.mockReturnValue(true);
    const mockDog = { ChipNumber: "123", HisunDate: "01/01/2023" };
    const mockData = { AnimalDetails: [mockDog] };
    const mockShow = "show1";

    // "TypeError: Failed to fetch"
    mockDoc.get.mockRejectedValue("TypeError: Failed to fetch");

    const result = await addDogToShow({ data: mockData, Show: mockShow });

    expect(result).toEqual({
      KalevetValid: true,
      brucelladate: undefined,
      BrucellaValid: false, // expected to be false according to code
      message: "אין חיבור לאינטרנט",
      status: 500,
    });
  });

  it("should return 404 for undefined chipnum error", async () => {
    GetHisunValid.mockReturnValue(true);
    // Simulate error thrown before get()
    // "TypeError: Cannot read properties of undefined (reading '0')"
    const mockData = {}; // AnimalDetails is undefined

    const result = await addDogToShow({ data: mockData, Show: "show1" });

    expect(result).toEqual({
      message: "מספר השבב שהזנת אינו קיים במערכת",
      status: 404,
    });
  });
});
