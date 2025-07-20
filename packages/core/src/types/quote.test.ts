import { QuoteItem, QuoteRepository } from "./quote";

describe("Test Suite for quotes", () => {
  describe("Test Suite for Quote", () => {
    it("should pass basic tests when using a date string", () => {
      const quoteItem = new QuoteItem("2025-07-13", 123.45);
      expect(quoteItem.date).toStrictEqual(new Date("2025-07-13"));
      expect(quoteItem.price).toBeCloseTo(123.45, 6);
    });

    it("should pass basic tests when using a Date object", () => {
      const quoteItem = new QuoteItem(new Date("2025-07-13"), 123.45);
      expect(quoteItem.date).toStrictEqual(new Date("2025-07-13"));
      expect(quoteItem.price).toBeCloseTo(123.45, 6);
    });

    it("should correctly throw exceptions on incorrect date formats", () => {
      const errorString = "Invalid date string provided";
      // semantically incorrect date
      expect(() => new QuoteItem("2023-02-29", 123.45)).toThrow(errorString);
      // not a date string at all
      expect(() => new QuoteItem("", 123.45)).toThrow(errorString);
      // incorrect format
      expect(() => new QuoteItem("2025-7-13", 123.45)).toThrow(errorString);
    });
  });

  describe("Test Suite for QuoteRepository", () => {
    it("should pass basic tests", () => {
      const repo = new QuoteRepository();
      expect(repo.getLatestQuote("DE1234567890")).toBeUndefined();
    });

    it("should be able to add quotes as objects", () => {
      const repo = new QuoteRepository();
      repo.add("DE1234567890", new QuoteItem("2025-07-14", 100));
      expect(repo.getLatestQuote("DE1234567890")).toBeDefined();
      expect(repo.getLatestQuote("DE1234567890")?.date).toStrictEqual(
        new Date("2025-07-14")
      );
      expect(repo.getLatestQuote("DE1234567890")?.price).toStrictEqual(100.0);
    });

    it("should be able to add quotes as parameters (date as string)", () => {
      const repo = new QuoteRepository();
      repo.add("DE1234567890", "2025-07-14", 100);
      expect(repo.getLatestQuote("DE1234567890")).toBeDefined();
      expect(repo.getLatestQuote("DE1234567890")?.date).toStrictEqual(
        new Date("2025-07-14")
      );
      expect(repo.getLatestQuote("DE1234567890")?.price).toStrictEqual(100.0);
    });

    it("should be able to add quotes as parameters (date as object)", () => {
      const repo = new QuoteRepository();
      repo.add("DE1234567890", new Date("2025-07-14"), 100);
      expect(repo.getLatestQuote("DE1234567890")).toBeDefined();
      expect(repo.getLatestQuote("DE1234567890")?.date).toStrictEqual(
        new Date("2025-07-14")
      );
      expect(repo.getLatestQuote("DE1234567890")?.price).toStrictEqual(100.0);
    });

    it("should correctly find the latest quote", () => {
      const repo = new QuoteRepository();

      // latest quote added in the middle; make sure sorting works as expected

      repo.add("DE1234567890", "2025-07-12", 110);
      repo.add("DE1234567890", "2025-07-13", 115);
      repo.add("DE1234567890", "2025-07-14", 120);
      repo.add("DE1234567890", "2025-07-11", 105);
      repo.add("DE1234567890", "2025-07-10", 100);

      expect(repo.getLatestQuote("DE1234567890")?.date).toStrictEqual(
        new Date("2025-07-14")
      );
      expect(repo.getLatestQuote("DE1234567890")?.price).toStrictEqual(120.0);
    });

    it("should correctly replace quotes with the same date", () => {
      const repo = new QuoteRepository();

      repo.add("DE1234567890", "2025-07-14", 100);
      repo.add("DE1234567890", new Date("2025-07-14"), 110);

      expect(repo.getLatestQuote("DE1234567890")?.price).toStrictEqual(110);
    });

    it("should correctly serialize and deserialize quotes", () => {
      const repo = new QuoteRepository();
      repo.add("DE1234567890", new QuoteItem("2025-07-14", 100));
      repo.add("US0987654321", new QuoteItem("2025-07-15", 110));

      const serialized = JSON.stringify(repo.toJSON());
      const parsed = JSON.parse(serialized);

      expect(parsed["DE1234567890"][0].date).toStrictEqual("2025-07-14");
      expect(parsed["US0987654321"][0].date).toStrictEqual("2025-07-15");

      const deserialized = QuoteRepository.fromJSON(parsed);

      expect(deserialized.getLatestQuote("DE1234567890")?.price).toStrictEqual(
        100
      );
      expect(deserialized.getLatestQuote("US0987654321")?.price).toStrictEqual(
        110
      );
    });
  });
});
