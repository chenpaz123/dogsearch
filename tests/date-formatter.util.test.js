const { fixdate, fixdatetodot } = require("../src/utils/date-formatter.util");

describe("fixdate utility", () => {
  it("formats YYYY-MM-DD to DD/MM/YYYY", () => {
    expect(fixdate("2023-04-05")).toBe("05/04/2023");
  });

  it("returns existing DD/MM/YYYY unchanged", () => {
    expect(fixdate("12/09/2023")).toBe("12/09/2023");
  });

  it("handles dot separated date", () => {
    expect(fixdate("31.01.2022")).toBe("31/01/2022");
  });

  it("handles Date instances", () => {
    expect(fixdate(new Date("2023-04-05T12:34:56Z"))).toBe("05/04/2023");
  });

  it("handles 2-digit year by rejecting invalid date", () => {
    expect(fixdate("12/09/23")).toBeUndefined();
  });

  it("returns undefined for invalid date", () => {
    expect(fixdate("not-a-date")).toBeUndefined();
  });

  it("returns undefined for blank date", () => {
    expect(fixdate("   ")).toBeUndefined();
  });
});

describe("fixdatetodot utility", () => {
  it("formats DD/MM/YYYY to DD.MM.YYYY", () => {
    expect(fixdatetodot("12/09/2023")).toBe("12.09.2023");
  });

  it("formats ISO date string", () => {
    expect(fixdatetodot("2023-04-05")).toBe("05.04.2023");
  });

  it("handles Date instances", () => {
    expect(fixdatetodot(new Date("2023-04-05T00:00:00Z"))).toBe("05.04.2023");
  });

  it("returns undefined for invalid date", () => {
    expect(fixdatetodot("31/31/2023")).toBeUndefined();
  });
});
