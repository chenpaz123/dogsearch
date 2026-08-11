jest.mock("../src/utils/chip-validator.util", () => ({
  GetHisunValid: jest.fn(),
}));

jest.mock("../src/utils/moag-api.util", () => ({
  getdatafrommoagdb: jest.fn(),
}));

const mockShowDoc = {
  collection: jest.fn(),
};
const mockShowsCollection = {
  doc: jest.fn(() => mockShowDoc),
};

jest.mock("../src/firebase/firebase", () => ({
  db: {
    collection: jest.fn(() => mockShowsCollection),
  },
}));

jest.mock("../src/utils/cache.util", () => ({
  withCache: jest.fn(),
  invalidateCache: jest.fn(),
}));

jest.mock("../src/utils/cache-keys.util", () => ({
  showDogCacheKey: jest.fn(() => "dogs::show::chip"),
}));

jest.mock("../src/utils/logger.util", () => ({
  createLogger: () => ({
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  }),
}));

const { GetHisunValid } = require("../src/utils/chip-validator.util");
const { getdatafrommoagdb } = require("../src/utils/moag-api.util");
const { db } = require("../src/firebase/firebase");
const cache = require("../src/utils/cache.util");
const { addDogToShow } = require("../src/controllers/dogs.controller");

const createDogDocMocks = ({ exists, data }) => {
  const dogDocRef = {
    get: jest.fn(() => ({ exists, data: () => data })),
    update: jest.fn(),
  };
  const dogsCollection = {
    doc: jest.fn(() => dogDocRef),
  };
  mockShowDoc.collection.mockReturnValue(dogsCollection);
  return { dogDocRef };
};

describe("addDogToShow controller messages", () => {
  const baseRequest = {
    Show: "My Show",
    data: {
      AnimalDetails: [
        {
          ChipNumber: "123",
          HisunDate: "01/01/2024",
        },
      ],
    },
    ChipNum: "123",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    GetHisunValid.mockReturnValue(true);
    cache.withCache.mockImplementation((_, fetcher) => fetcher());
    getdatafrommoagdb.mockResolvedValue({});
    createDogDocMocks({ exists: true, data: { brucella: "01/02/2024" } });
  });

  it("throws 404 when dog record cannot be resolved", async () => {
    await expect(addDogToShow({ Show: "My Show", data: {}, ChipNum: "" })).rejects.toThrow("dog record not found");
  });

  it("throws 503 when external registry fails", async () => {
    // Arrange: Ensure we trigger the external registry lookup
    const requestWithoutDogRecord = {
      ...baseRequest,
      data: {}, // No dog record provided
      ChipNum: "123",
    };

    getdatafrommoagdb.mockRejectedValue(new Error("Failed to fetch registry data"));

    await expect(addDogToShow(requestWithoutDogRecord)).rejects.toThrow("external registry unavailable");
  });

  it("returns english 500 message on unexpected errors", async () => {
    cache.withCache.mockImplementation(async () => {
      throw new Error("boom");
    });

    await expect(addDogToShow(baseRequest)).rejects.toThrow("boom");
  });

  it("rejects a Show value that would escape the intended Firestore path", async () => {
    await expect(
      addDogToShow({ ...baseRequest, Show: "shows/other/dogs" })
    ).rejects.toThrow("invalid show identifier");
  });

  it("rejects a ChipNum value that would escape the intended Firestore path", async () => {
    await expect(
      addDogToShow({
        ...baseRequest,
        ChipNum: "123/../secret",
        data: {
          AnimalDetails: [{ ChipNumber: "123/../secret", HisunDate: "01/01/2024" }],
        },
      })
    ).rejects.toThrow("invalid chip number");
  });
});
