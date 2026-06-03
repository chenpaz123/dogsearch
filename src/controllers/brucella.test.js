const { brucellafiresotre } = require("./brucella");
const { db } = require("../firebase/firebase");

const mockSet = jest.fn();
jest.mock("../firebase/firebase", () => {
  const mockDocDogs = jest.fn(() => ({ set: mockSet }));
  const mockCollectionDogs = jest.fn(() => ({ doc: mockDocDogs }));
  const mockDocShows = jest.fn(() => ({ collection: mockCollectionDogs }));
  const mockCollectionShows = jest.fn(() => ({ doc: mockDocShows }));
  return {
    db: {
      collection: mockCollectionShows
    }
  };
});

describe("brucellafiresotre", () => {
  let consoleSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  it("should return success message and status 201 when set is successful", async () => {
    mockSet.mockResolvedValueOnce();

    const result = await brucellafiresotre("showA", "chip123", "2023-01-01");

    expect(result).toEqual({
      message: "brucella added successfully",
      status: 201,
    });
    expect(mockSet).toHaveBeenCalledWith({ brucella: "2023-01-01" });
  });

  it("should return error message and status 400 when set throws an error", async () => {
    const testError = new Error("Firestore error");
    mockSet.mockRejectedValueOnce(testError);

    const result = await brucellafiresotre("showA", "chip123", "2023-01-01");

    expect(result).toEqual({
      message: "brucella not added",
      status: 400,
    });
    expect(consoleSpy).toHaveBeenCalledWith(testError);
  });
});
