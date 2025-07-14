import { parseLocaleNumber, parseNumberWithAutoLocale } from "./numberutils";

describe("Test Suite for numberutils", () => {
  describe("Test Suite for parseNumberWithAutoLocale", () => {
    it("should pass basic tests", () => {
      expect(parseNumberWithAutoLocale("1,300.00")).toStrictEqual(1300);
      expect(parseNumberWithAutoLocale("1.300,00")).toStrictEqual(1300);

      expect(parseNumberWithAutoLocale("1.300.000,50")).toStrictEqual(
        1300000.5
      );
      expect(parseNumberWithAutoLocale("1,300,000.50")).toStrictEqual(
        1300000.5
      );

      expect(parseNumberWithAutoLocale("123,45")).toStrictEqual(123.45);
      expect(parseNumberWithAutoLocale("123.45")).toStrictEqual(123.45);

      expect(parseNumberWithAutoLocale("42")).toStrictEqual(42);

      expect(parseNumberWithAutoLocale("-1.234,56")).toStrictEqual(-1234.56);
      expect(parseNumberWithAutoLocale("-1,234.56")).toStrictEqual(-1234.56);

      expect(parseNumberWithAutoLocale("0,5")).toStrictEqual(0.5);
      expect(parseNumberWithAutoLocale("0.5")).toStrictEqual(0.5);

      expect(parseNumberWithAutoLocale("invalid")).toStrictEqual(NaN);
    });
  });

  describe("Test Suite for parseLocaleNumber", () => {
    it("should pass basic tests", () => {
      expect(parseLocaleNumber("1.300,00", "de-DE")).toStrictEqual(1300);
      expect(parseLocaleNumber("1,300.00", "en-GB")).toStrictEqual(1300);

      expect(parseLocaleNumber("1.300.000,50", "de-DE")).toStrictEqual(
        1300000.5
      );
      expect(parseLocaleNumber("1,300,000.50", "en-GB")).toStrictEqual(
        1300000.5
      );

      expect(parseLocaleNumber("123,45", "de-DE")).toStrictEqual(123.45);
      expect(parseLocaleNumber("123.45", "en-GB")).toStrictEqual(123.45);

      expect(parseLocaleNumber("42", "de-DE")).toStrictEqual(42);
      expect(parseLocaleNumber("42", "en-GB")).toStrictEqual(42);

      expect(parseLocaleNumber("-1.234,56", "de-DE")).toStrictEqual(-1234.56);
      expect(parseLocaleNumber("-1,234.56", "en-GB")).toStrictEqual(-1234.56);

      expect(parseLocaleNumber("invalid", "de-DE")).toBeNaN();
    });
  });
});
