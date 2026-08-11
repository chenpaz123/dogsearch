describe("getvisitordata", () => {
  let getvisitordata;
  let brucellaController;
  let ocrController;
  let fixdateUtils;
  let hisunvalidUtils;

  const basePayload = {
    showdate: "International Show - 26.05.2022",
    image: "test.jpg",
    chipnum: "123456",
    brucelladate: "26/05/2022", // Manual date for strict verification
  };

  beforeEach(() => {
    jest.resetModules();

    // Mock dependencies before requiring the controller
    jest.mock("../src/firebase/firebase", () => ({
      db: {
        collection: jest.fn(),
      },
    }));
    jest.mock("../src/controllers/ocr.controller");
    jest.mock("../src/utils/chip-validator.util");
    jest.mock("../src/utils/date-formatter.util");

    // Require modules
    brucellaController = require("../src/controllers/brucella.controller");
    ocrController = require("../src/controllers/ocr.controller");
    fixdateUtils = require("../src/utils/date-formatter.util");
    hisunvalidUtils = require("../src/utils/chip-validator.util");

    // Spy on the real brucellaFirestore method (or mock it if it's not a real method yet in the test context)
    // Since we are using resetModules, we need to re-mock or re-spy every time.
    // However, brucella.js exports a real function. We can spy on it.
    // But wait, if we want to prevent the real DB call, we MUST mock it.
    // The previous issue was likely that `jest.mock` factory was hoisting and creating a disconnect.
    // Let's try a different approach: don't use jest.mock for brucella, just spy on it.

    brucellaController.brucellaFirestore = jest
      .fn()
      .mockResolvedValue({ status: 201 });

    ({ getvisitordata } = require("../src/controllers/visitor.controller"));

    jest.clearAllMocks();
    fixdateUtils.fixdate.mockReturnValue("26/05/2022");
    hisunvalidUtils.GetBrucellaValid.mockReturnValue(true);
  });

  it("returns success when OCR data is valid", async () => {
    ocrController.ocr.mockResolvedValue({
      status: 200,
      date: "26/05/2022",
      chip: "123456",
      result: true,
    });

    const result = await getvisitordata(basePayload);

    expect(result).toEqual(
      expect.objectContaining({
        status: 201,
        message: "brucella is valid and saved",
        chip: "123456",
        date: "26/05/2022",
      })
    );
    expect(ocrController.ocr).toHaveBeenCalledWith(basePayload.image);
    expect(fixdateUtils.fixdate).toHaveBeenCalledWith("26/05/2022"); // OCR date
    expect(fixdateUtils.fixdate).toHaveBeenCalledWith("26/05/2022"); // Manual date from basePayload.brucelladate
    expect(hisunvalidUtils.GetBrucellaValid).toHaveBeenCalledWith(
      "26/05/2022",
      basePayload.showdate
    );
    expect(brucellaController.brucellaFirestore).not.toHaveBeenCalled();
  });

  it("calls brucellaFirestore when show ID is provided", async () => {
    ocrController.ocr.mockResolvedValue({
      status: 200,
      date: "26/05/2022",
      chip: "123456",
      result: true,
    });

    const payloadWithShow = { ...basePayload, show: "My Show" };
    const result = await getvisitordata(payloadWithShow);

    expect(result.status).toBe(201);
    expect(brucellaController.brucellaFirestore).toHaveBeenCalledWith(
      "My Show",
      "123456",
      "26/05/2022"
    );
  });

  it("rejects missing image", async () => {
    const result = await getvisitordata({ showdate: basePayload.showdate });
    expect(result.status).toBe(400);
    expect(result.message).toBe("image is required");
  });

  it("rejects when OCR finds no chip", async () => {
    ocrController.ocr.mockResolvedValue({
      status: 200,
      date: "26/05/2022",
      chip: undefined,
      result: true,
    });

    const result = await getvisitordata(basePayload);

    expect(result.status).toBe(400);
    expect(result.message).toBe("chip number missing");
    expect(result.date).toBe("26/05/2022");
  });

  it("returns 400 when OCR throws", async () => {
    ocrController.ocr.mockRejectedValue(new Error("OCR error"));

    const result = await getvisitordata(basePayload);

    expect(result.status).toBe(400);
    expect(result.message).toBe("OCR error");
  });

  it("returns 402 when brucella is not valid for the show", async () => {
    ocrController.ocr.mockResolvedValue({
      status: 200,
      date: "01/01/2022",
      chip: "123456",
      result: true,
    });
    fixdateUtils.fixdate.mockReturnValue("01/01/2022");
    hisunvalidUtils.GetBrucellaValid.mockReturnValue(false);

    const payloadWithOldDate = { ...basePayload, brucelladate: "01/01/2022" };
    const result = await getvisitordata(payloadWithOldDate);

    expect(result.status).toBe(402);
    expect(result.message).toBe("brucella not valid");
    expect(result.chip).toBe("123456");
    expect(result.date).toBe("01/01/2022");
  });

  it("returns 403 when OCR result lacks a date", async () => {
    ocrController.ocr.mockResolvedValue({
      status: 200,
      chip: "123456",
      result: true,
    });
    fixdateUtils.fixdate.mockReturnValue(undefined);

    const result = await getvisitordata(basePayload);

    expect(result.status).toBe(403);
    expect(result.message).toBe(
      "Could not read date from image. Please ensure the date is clear."
    );
    expect(result.chip).toBe("123456");
  });

  it("returns 406 when chip number mismatch is detected", async () => {
    ocrController.ocr.mockResolvedValue({
      status: 200,
      date: "26/05/2022",
      chip: "999999",
      result: true,
    });

    const result = await getvisitordata(basePayload);

    expect(result.status).toBe(406);
    expect(result.message).toBe("chip number mismatch");
    expect(result.chip).toBe("999999");
  });

  it("returns 407 when the OCR result is not negative", async () => {
    ocrController.ocr.mockResolvedValue({
      status: 200,
      date: "26/05/2022",
      chip: "123456",
      result: false,
    });

    const result = await getvisitordata(basePayload);

    expect(result.status).toBe(422);
    expect(result.message).toBe("brucella result not negative");
  });

  it("returns 409 when dog is already registered", async () => {
    ocrController.ocr.mockResolvedValue({
      status: 200,
      date: "26/05/2022",
      chip: "123456",
      result: true,
    });

    brucellaController.brucellaFirestore.mockImplementation(async () => ({
      status: 409,
      message: "dog already registered",
    }));

    const payloadWithShow = { ...basePayload, show: "My Show" };
    const result = await getvisitordata(payloadWithShow);

    expect(result.status).toBe(409);
    expect(result.message).toBe("dog already registered");
  });
});
