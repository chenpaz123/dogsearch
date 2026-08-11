const mockSetBrucella = jest.fn();
const mockGetBrucella = jest.fn();

jest.mock("../src/firebase/firebase", () => ({
  db: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        collection: jest.fn(() => ({
          doc: jest.fn(() => ({
            set: mockSetBrucella,
            get: mockGetBrucella,
          })),
        })),
      })),
    })),
  },
}));

const { brucellaFirestore } = require("../src/controllers/brucella.controller");

describe("brucellaFirestore controller", () => {
  beforeEach(() => {
    mockSetBrucella.mockReset();
    mockGetBrucella.mockReset();
    mockGetBrucella.mockResolvedValue({ exists: false });
  });

  it("throws validation error for missing fields", async () => {
    await expect(brucellaFirestore("", "", "")).rejects.toThrow("show, chip number and date are required");
    expect(mockSetBrucella).not.toHaveBeenCalled();
  });

  it("stores brucella date", async () => {
    mockSetBrucella.mockResolvedValue();
    const result = await brucellaFirestore("Show", "123", "01/01/2024");
    expect(result.status).toBe(201);
    expect(result.chip).toBe("123");
    expect(mockSetBrucella).toHaveBeenCalledWith({ brucella: "01/01/2024" }, { merge: true });
  });

  it("throws on database failure", async () => {
    mockSetBrucella.mockRejectedValue(new Error("write failed"));
    await expect(brucellaFirestore("Show", "123", "01/01/2024")).rejects.toThrow("write failed");
  });
});