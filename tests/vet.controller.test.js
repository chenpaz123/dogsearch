jest.mock("../src/utils/vet-registry.util", () => ({
  lookupVetByLicense: jest.fn(),
}));

jest.mock("../src/utils/logger.util", () => ({
  createLogger: () => ({
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  }),
}));

const { lookupVetByLicense } = require("../src/utils/vet-registry.util");
const { vetLogin } = require("../src/controllers/vet.controller");

describe("vetLogin controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("throws 400 when license number is missing", async () => {
    await expect(vetLogin("")).rejects.toThrow("license number is required");
    expect(lookupVetByLicense).not.toHaveBeenCalled();
  });

  it("throws 400 when license number is only whitespace", async () => {
    await expect(vetLogin("   ")).rejects.toThrow("license number is required");
  });

  it("throws 404 when no matching vet is found", async () => {
    lookupVetByLicense.mockResolvedValue(null);

    await expect(vetLogin("12345")).rejects.toThrow(
      "no veterinarian found for this license number"
    );
  });

  it("throws 503 when the registry lookup fails", async () => {
    lookupVetByLicense.mockRejectedValue(new Error("network down"));

    await expect(vetLogin("12345")).rejects.toThrow("external registry unavailable");
  });

  it("returns the vet's name on a successful match", async () => {
    lookupVetByLicense.mockResolvedValue({
      firstName: "Dana",
      lastName: "Cohen",
      licenseNumber: "12345",
    });

    const result = await vetLogin(" 12345 ");

    expect(lookupVetByLicense).toHaveBeenCalledWith("12345");
    expect(result).toMatchObject({
      status: 200,
      vetFirstName: "Dana",
      vetLastName: "Cohen",
    });
  });
});
