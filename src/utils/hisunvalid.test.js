const { GetHisunValid, GetBrucellaValid } = require("./hisunvalid");
const moment = require("moment");

describe("GetHisunValid", () => {
  beforeEach(() => {
    // Set a fixed date for today to ensure deterministic testing.
    // Using midnight ensures diff calculation matches the full days accurately.
    jest.useFakeTimers().setSystemTime(new Date("2023-05-15T00:00:00").getTime());
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should return true for today", () => {
    expect(GetHisunValid("15/05/2023")).toBe(true);
  });

  it("should return true for exactly 365 days ago", () => {
    // 2022 is not a leap year, so 365 days ago is exactly May 15, 2022
    expect(GetHisunValid("15/05/2022")).toBe(true);
  });

  it("should return true for a date within 365 days", () => {
    expect(GetHisunValid("01/01/2023")).toBe(true);
  });

  it("should return false for exactly 366 days ago", () => {
    expect(GetHisunValid("14/05/2022")).toBe(false);
  });

  it("should return false for a future date (negative diff)", () => {
    expect(GetHisunValid("16/05/2023")).toBe(false);
  });
});

describe("GetBrucellaValid", () => {
  it("should return true when hisundate is exactly showdate", () => {
    expect(GetBrucellaValid("15/05/2023", "15/05/2023")).toBe(true);
  });

  it("should return true when hisundate is exactly 365 days before showdate", () => {
    expect(GetBrucellaValid("15/05/2022", "15/05/2023")).toBe(true);
  });

  it("should return true when hisundate is within 365 days before showdate", () => {
    expect(GetBrucellaValid("01/01/2023", "15/05/2023")).toBe(true);
  });

  it("should return false when hisundate is exactly 366 days before showdate", () => {
    expect(GetBrucellaValid("14/05/2022", "15/05/2023")).toBe(false);
  });

  it("should return false when hisundate is after showdate (negative diff)", () => {
    expect(GetBrucellaValid("16/05/2023", "15/05/2023")).toBe(false);
  });
});
