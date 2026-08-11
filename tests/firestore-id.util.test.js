const { isValidFirestoreDocId } = require("../src/utils/firestore-id.util");

describe("isValidFirestoreDocId", () => {
  it("accepts plain strings and numbers", () => {
    expect(isValidFirestoreDocId("My Show - 01.02.2024")).toBe(true);
    expect(isValidFirestoreDocId(123456789012345)).toBe(true);
  });

  it("rejects values containing a path separator", () => {
    expect(isValidFirestoreDocId("shows/other/dogs")).toBe(false);
    expect(isValidFirestoreDocId("123/../secret")).toBe(false);
  });

  it("rejects the reserved '.' and '..' segments", () => {
    expect(isValidFirestoreDocId(".")).toBe(false);
    expect(isValidFirestoreDocId("..")).toBe(false);
  });

  it("rejects empty, nullish, or non-primitive values", () => {
    expect(isValidFirestoreDocId("")).toBe(false);
    expect(isValidFirestoreDocId(null)).toBe(false);
    expect(isValidFirestoreDocId(undefined)).toBe(false);
    expect(isValidFirestoreDocId({})).toBe(false);
    expect(isValidFirestoreDocId(["a"])).toBe(false);
  });

  it("rejects ids longer than Firestore's 1500 byte limit", () => {
    expect(isValidFirestoreDocId("a".repeat(1501))).toBe(false);
    expect(isValidFirestoreDocId("a".repeat(1500))).toBe(true);
  });
});
