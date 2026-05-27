const { fixdate } = require("./fixdate");

describe("fixdate", () => {
  it("should format DD/MM/YYYY to DD/MM/YYYY", () => {
    expect(fixdate("25/12/2023")).toBe("25/12/2023");
  });

  it("should format DD.MM.YYYY to DD/MM/YYYY", () => {
    expect(fixdate("25.12.2023")).toBe("25/12/2023");
  });

  it("should format DD-MM-YYYY to DD/MM/YYYY", () => {
    expect(fixdate("25-12-2023")).toBe("25/12/2023");
  });

  it("should format YYYY-MM-DD to DD/MM/YYYY", () => {
    expect(fixdate("2023-12-25")).toBe("25/12/2023");
  });

  it("should format DD/M/YYYY to DD/MM/YYYY", () => {
    expect(fixdate("25/5/2023")).toBe("25/05/2023");
  });

  it("should format DD/MM/YY to DD/MM/YYYY", () => {
    expect(fixdate("25/12/23")).toBe("25/12/2023");
  });

  it("should format DD/MM to DD/MM/YYYY", () => {
    const currentYear = new Date().getFullYear();
    expect(fixdate("25/12")).toBe(`25/12/${currentYear}`);
  });

  it("should return undefined for invalid dates", () => {
    expect(fixdate("invalid date")).toBeUndefined();
  });
});
