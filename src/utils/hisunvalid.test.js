const { GetBrucellaValid } = require("./hisunvalid");

describe("GetBrucellaValid", () => {
  it("should return true when hisun date is exactly 365 days before show date", () => {
    expect(GetBrucellaValid("01/01/2022", "01/01/2023")).toBe(true);
  });

  it("should return true when hisun date is exactly the same as show date", () => {
    expect(GetBrucellaValid("01/01/2023", "01/01/2023")).toBe(true);
  });

  it("should return true when hisun date is within 365 days before show date", () => {
    expect(GetBrucellaValid("15/06/2022", "01/01/2023")).toBe(true);
  });

  it("should return false when hisun date is more than 365 days before show date", () => {
    expect(GetBrucellaValid("31/12/2021", "01/01/2023")).toBe(false);
  });

  it("should return false when hisun date is after show date", () => {
    expect(GetBrucellaValid("02/01/2023", "01/01/2023")).toBe(false);
  });
});
