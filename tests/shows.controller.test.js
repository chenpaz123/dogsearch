const mockSetShow = jest.fn();

jest.mock("../src/firebase/firebase", () => ({
  db: {
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        set: mockSetShow,
      })),
    })),
  },
}));

const { addshow } = require("../src/controllers/shows.controller");

describe("addshow controller", () => {
  beforeEach(() => {
    mockSetShow.mockReset();
  });

  it("throws validation error for missing show name", async () => {
    await expect(addshow({ KenelClubName: "" })).rejects.toThrow("show name is required");
    expect(mockSetShow).not.toHaveBeenCalled();
  });

  it("stores show with trimmed name", async () => {
    mockSetShow.mockResolvedValue();
    const result = await addshow({ KenelClubName: "  My Show  " });
    expect(result.status).toBe(201);
    expect(mockSetShow).toHaveBeenCalledWith(
      expect.objectContaining({ KenelClubName: "My Show" })
    );
  });

  it("throws on database failure", async () => {
    mockSetShow.mockRejectedValue(new Error("boom"));
    await expect(addshow({ KenelClubName: "Show" })).rejects.toThrow("boom");
  });
});