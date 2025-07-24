import {
  getDateObject,
  isValidFormattedString,
  isValidISODateString,
  normalizeDate,
} from "./dateutils.js";

describe("Test suite for dateutils", () => {
  describe("Test suite for normalizeDate", () => {
    it("should pass basic tests", () => {
      expect(normalizeDate(new Date("2025-07-13")).toISOString()).toStrictEqual(
        "2025-07-13T00:00:00.000Z"
      );
    });
  });

  describe("Test suite for getDateObject", () => {
    it("should pass basic tests", () => {
      const date = new Date("2025-07-13");
      expect(getDateObject(date)).toStrictEqual(date);
      expect(getDateObject("2025-07-13")).toStrictEqual(date);
      expect(getDateObject("13.07.2025")).toStrictEqual(date);
      expect(getDateObject("13/07/2025")).toStrictEqual(date);
    });

    it("should correctly throw an exception if the date string is incorrect", () => {
      const errorString = "Invalid date string provided";
      // semantically incorrect date
      expect(() => getDateObject("2023-02-29")).toThrow(errorString);
      // not a date string at all
      expect(() => getDateObject("")).toThrow(errorString);
      // incorrect format
      expect(() => getDateObject("2025-7-13")).toThrow(errorString);
    });
  });

  describe("Test suite for isValidISODateString", () => {
    it("should pass basic tests for valid dates", () => {
      expect(isValidISODateString("2025-07-13")).toStrictEqual(true);
      expect(isValidISODateString("2024-02-29")).toStrictEqual(true); // leap year
      expect(isValidISODateString("2023-01-01")).toStrictEqual(true);
      expect(isValidISODateString("1999-12-31")).toStrictEqual(true);
    });

    it("should correctly recognise semantically incorrect dates", () => {
      expect(isValidISODateString("2023-02-29")).toStrictEqual(false);
      expect(isValidISODateString("2023-04-31")).toStrictEqual(false);
      expect(isValidISODateString("2023-13-01")).toStrictEqual(false);
      expect(isValidISODateString("2023-01-00")).toStrictEqual(false);
      expect(isValidISODateString("2023-01-32")).toStrictEqual(false);
    });

    it("should correctly recognise incorrect date format strings", () => {
      expect(isValidISODateString("")).toStrictEqual(false);
      expect(isValidISODateString("Not a date")).toStrictEqual(false);
      expect(isValidISODateString("2025-07-13T10:00:00Z")).toStrictEqual(false);
      expect(isValidISODateString("2025-07-1")).toStrictEqual(false);
      expect(isValidISODateString("2025-7-13")).toStrictEqual(false);
      expect(isValidISODateString("2025/07/13")).toStrictEqual(false);
    });
  });

  describe("Test suite for isValidFormattedString", () => {
    it("should pass basic tests for valid dates", () => {
      expect(isValidFormattedString("13.07.2025")).toStrictEqual(true);
      expect(isValidFormattedString("29.02.2024")).toStrictEqual(true); // leap year
      expect(isValidFormattedString("01.01.2023")).toStrictEqual(true);
      expect(isValidFormattedString("31.12.1999")).toStrictEqual(true);

      expect(isValidFormattedString("13/07/2025")).toStrictEqual(true);
      expect(isValidFormattedString("29/02/2024")).toStrictEqual(true); // leap year
      expect(isValidFormattedString("01/01/2023")).toStrictEqual(true);
      expect(isValidFormattedString("31/12/1999")).toStrictEqual(true);
    });

    it("should correctly recognise semantically incorrect dates", () => {
      expect(isValidFormattedString("29.02.2023")).toStrictEqual(false);
      expect(isValidFormattedString("31.04.2023")).toStrictEqual(false);
      expect(isValidFormattedString("01.13.2023")).toStrictEqual(false);
      expect(isValidFormattedString("00.01.2023")).toStrictEqual(false);
      expect(isValidFormattedString("32.01.2023")).toStrictEqual(false);

      expect(isValidFormattedString("29/02/2023")).toStrictEqual(false);
      expect(isValidFormattedString("31/04/2023")).toStrictEqual(false);
      expect(isValidFormattedString("01/13/2023")).toStrictEqual(false);
      expect(isValidFormattedString("00/01/2023")).toStrictEqual(false);
      expect(isValidFormattedString("32/01/2023")).toStrictEqual(false);
    });

    it("should correctly recognise incorrect date format strings", () => {
      expect(isValidFormattedString("")).toStrictEqual(false);
      expect(isValidFormattedString("Not a date")).toStrictEqual(false);
      expect(isValidFormattedString("2025-07-13")).toStrictEqual(false);
      expect(isValidFormattedString("13.7.2025")).toStrictEqual(false);
      expect(isValidFormattedString("13/7/2025")).toStrictEqual(false);
      expect(isValidFormattedString("7/13/2025")).toStrictEqual(false);
    });
  });
});
