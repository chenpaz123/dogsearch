const mockSet = jest.fn();
const mockGet = jest.fn();
const mockDelete = jest.fn();
const mockBatchDelete = jest.fn();
const mockBatchCommit = jest.fn();
const mockTransactionGet = jest.fn();
const mockTransactionSet = jest.fn();
const mockTransactionDelete = jest.fn();

jest.mock("../src/firebase/firebase", () => {
  const mockQuery = {
    get: mockGet,
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    startAfter: jest.fn().mockReturnThis(),
  };

  return {
    db: {
      collection: jest.fn(() => ({
        doc: jest.fn(() => ({
          get: mockGet,
          set: mockSet,
          delete: mockDelete,
          collection: jest.fn(() => ({
            get: mockGet,
            doc: jest.fn(() => ({
              set: mockSet,
              delete: mockDelete,
            })),
          })),
        })),
        get: mockGet,
        orderBy: jest.fn(() => mockQuery),
        limit: jest.fn(() => mockQuery),
      })),
      batch: jest.fn(() => ({
        delete: mockBatchDelete,
        commit: mockBatchCommit,
      })),
      runTransaction: jest.fn((callback) => {
        const transaction = {
          get: mockTransactionGet,
          set: mockTransactionSet,
          delete: mockTransactionDelete,
        };
        return callback(transaction);
      }),
    },
  };
});

jest.mock("../src/utils/cache.util", () => ({
  withCache: jest.fn((key, fetcher) => fetcher()),
  invalidateCache: jest.fn(),
}));

const {
  createShow,
  getallshows,
  updateshow,
  deleteShow,
} = require("../src/controllers/manager.controller");

describe("manger controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createShow", () => {
    it("creates a show successfully", async () => {
      mockGet.mockResolvedValue({ exists: false });
      mockSet.mockResolvedValue();

      const result = await createShow(
        "Test Show",
        "01.01.2024",
        "Test Description"
      );

      expect(result.status).toBe(200);
      expect(mockSet).toHaveBeenCalledWith({
        desc: "Test Description",
        KenelClubName: "Test Show",
        ShowDate: "01.01.2024",
      });
    });

    it("throws 409 if show already exists", async () => {
      mockGet.mockResolvedValue({ exists: true });

      await expect(
        createShow("Test Show", "01.01.2024", "Test Description")
      ).rejects.toThrow("show already exists");
    });
  });

  describe("getallshows", () => {
    it("returns shows with dog counts", async () => {
      const mockDocs = [
        {
          id: "Show 1 - 01.01.2024",
          data: () => ({ desc: "Desc 1" }),
          ref: {
            collection: jest.fn(() => ({
              get: jest.fn().mockResolvedValue({ size: 5 }),
            })),
          },
        },
      ];
      mockGet.mockResolvedValue({
        empty: false,
        docs: mockDocs,
        size: 1,
        forEach: (cb) => mockDocs.forEach(cb),
      });

      const result = await getallshows();

      expect(result.status).toBe(200);
      expect(result.shows).toHaveLength(1);
      expect(result.shows[0].dogCount).toBe(5);
      expect(result.shows[0].desc).toBe("Desc 1");
    });
  });

  describe("updateshow", () => {
    it("updates show description", async () => {
      mockGet.mockResolvedValue({ exists: true });
      mockSet.mockResolvedValue();

      const oldShow = { name: "Show 1", date: "01.01.2024" };
      const newShow = { name: "Show 1", date: "01.01.2024", desc: "New Desc" };

      const result = await updateshow(oldShow, newShow);

      expect(result.status).toBe(200);
      expect(mockSet).toHaveBeenCalledWith(
        { desc: "New Desc" },
        { merge: true }
      );
    });
  });

  describe("deleteShow", () => {
    it("deletes a show", async () => {
      mockGet
        .mockResolvedValueOnce({ exists: true })
        .mockResolvedValueOnce({ empty: true });

      const result = await deleteShow({ name: "Show 1", date: "01.01.2024" });

      expect(result.status).toBe(200);
      expect(mockDelete).toHaveBeenCalled();
    });
  });
});
