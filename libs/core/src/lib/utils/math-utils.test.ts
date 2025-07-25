import { areEffectivelyEqual, isEffectivelyZero } from "./math-utils.js";

describe("Test Suite for math-utils", () => {
  describe("Test Suite for areEffectivelyEqual", () => {
    it("should pass basic tests", () => {
      expect(areEffectivelyEqual(1, 1)).toStrictEqual(true);
      expect(areEffectivelyEqual(1, 1.0000001)).toStrictEqual(true);
      expect(areEffectivelyEqual(-1, -1.0000001)).toStrictEqual(true);
    });
  });

  describe("Test Suite for isEffectivelyZero", () => {
    it("should pass basic tests", () => {
      expect(isEffectivelyZero(0)).toStrictEqual(true);
      expect(isEffectivelyZero(1)).toStrictEqual(false);
      expect(isEffectivelyZero(-1)).toStrictEqual(false);
      expect(isEffectivelyZero(0.0000000000000001 / 2)).toStrictEqual(true);
      expect(isEffectivelyZero(-0.0000000000000001 / 2)).toStrictEqual(true);
    });
  });
});
