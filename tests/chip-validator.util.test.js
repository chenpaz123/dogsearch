const moment = require("moment");
const { GetHisunValid, GetBrucellaValid } = require("../src/utils/chip-validator.util");

describe("Hisun and Brucella validity", () => {
  it("flags recent hisun as valid", () => {
    const recent = moment().subtract(100, "days").format("DD/MM/YYYY");
    expect(GetHisunValid(recent)).toBe(true);
  });

  it("flags old hisun as invalid", () => {
    const old = moment().subtract(500, "days").format("DD/MM/YYYY");
    expect(GetHisunValid(old)).toBe(false);
  });

  it("validates brucella date relative to show date", () => {
    const brucella = "01/01/2023";
    const show = "01/06/2023";
    expect(GetBrucellaValid(brucella, show)).toBe(true);
  });

  it("invalidates brucella date older than a year", () => {
    const brucella = "01/01/2022";
    const show = "15/03/2023";
    expect(GetBrucellaValid(brucella, show)).toBe(false);
  });
});