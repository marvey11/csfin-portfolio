import { getDateObject, normalizeDate } from "./dateutils.js";
import {
  formatCurrency,
  formatNormalizedDate,
  formatPercent,
} from "./formatters.js";

describe("Test Suite for formatters", () => {
  describe("Test Suite for formatCurrency", () => {
    it("should format correctly when no locale is given", () => {
      expect(formatCurrency(1234.56)).toStrictEqual("€1,234.56");
    });

    it("should format correctly when specifying a locale", () => {
      expect(formatCurrency(1234.56, "de-DE")).toStrictEqual("1.234,56\u00A0€");
    });
  });

  describe("Test Suite for formatPercent", () => {
    it("should format correctly when only the value is given", () => {
      expect(formatPercent(0.123)).toStrictEqual("12.30%");
      expect(formatPercent(0.1234)).toStrictEqual("12.34%");
      expect(formatPercent(0.12345)).toStrictEqual("12.35%");
    });

    it("should format correctly when the fraction digits are given", () => {
      expect(formatPercent(0.12345, 2)).toStrictEqual("12.35%");
      expect(formatPercent(0.12345, 4)).toStrictEqual("12.3450%");
    });

    it("should format correctly when the locale is given", () => {
      expect(formatPercent(0.12345, 2, "de-DE")).toStrictEqual("12,35\u00A0%");
      expect(formatPercent(0.12345, 2, "en-GB")).toStrictEqual("12.35%");
    });
  });

  describe("Test Suite for formatNormalizedDate", () => {
    it("should format correctly when no locale is given", () => {
      expect(formatNormalizedDate(getDateObject("2025-07-13"))).toStrictEqual(
        "2025-07-13"
      );
      expect(
        formatNormalizedDate(getDateObject(new Date("2025-07-13")))
      ).toStrictEqual("2025-07-13");
    });

    it("should format correctly with a locale given", () => {
      expect(
        formatNormalizedDate(normalizeDate(new Date("2025-07-13")), "de-DE")
      ).toStrictEqual("13.07.2025");
      expect(
        formatNormalizedDate(normalizeDate(new Date("2025-07-13")), "en-GB")
      ).toStrictEqual("13/07/2025");
    });
  });
});
