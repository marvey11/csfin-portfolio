import { QuoteItem } from "./QuoteItem";
import { QuoteRepository } from "./QuoteRepository";

describe("Test Suite for QuoteRepository", () => {
  const isin = "DE1234567890";

  let repo: QuoteRepository;

  beforeEach(() => {
    repo = new QuoteRepository();
  });

  describe("add method", () => {
    it("should be able to add quotes as objects", () => {
      repo.add(isin, new QuoteItem("2025-07-14", 100));
      expect(repo.getLatestQuote(isin)).toBeDefined();
      expect(repo.getLatestQuote(isin)?.date).toStrictEqual(
        new Date("2025-07-14")
      );
      expect(repo.getLatestQuote(isin)?.price).toStrictEqual(100.0);
    });

    it("should be able to add quotes as parameters (date as string)", () => {
      repo.add(isin, "2025-07-14", 100);
      expect(repo.getLatestQuote(isin)).toBeDefined();
      expect(repo.getLatestQuote(isin)?.date).toStrictEqual(
        new Date("2025-07-14")
      );
      expect(repo.getLatestQuote(isin)?.price).toStrictEqual(100.0);
    });

    it("should be able to add quotes as parameters (date as object)", () => {
      repo.add(isin, new Date("2025-07-14"), 100);
      expect(repo.getLatestQuote(isin)).toBeDefined();
      expect(repo.getLatestQuote(isin)?.date).toStrictEqual(
        new Date("2025-07-14")
      );
      expect(repo.getLatestQuote(isin)?.price).toStrictEqual(100.0);
    });

    it("should correctly replace quotes with the same date", () => {
      repo.add(isin, "2025-07-14", 100);
      repo.add(isin, new Date("2025-07-14"), 110);

      expect(repo.getLatestQuote(isin)?.price).toStrictEqual(110);
    });

    it("should throw an exception when supplying invalid arguments", () => {
      const errorMessage = /^Invalid arguments for add./;

      expect(() => {
        repo.add(isin, null as unknown as QuoteItem);
      }).toThrow(errorMessage);

      expect(() => {
        repo.add(isin, new Date("2025-07-14"), undefined as unknown as number);
      }).toThrow(errorMessage);

      expect(() => {
        repo.add(isin, new Date("2025-07-14"), null as unknown as number);
      }).toThrow(errorMessage);
    });
  });

  describe("getLatestQuote method", () => {
    it("should correctly find the latest quote", () => {
      // latest quote added in the middle; make sure sorting works as expected

      repo.add(isin, "2025-07-12", 110);
      repo.add(isin, "2025-07-13", 115);
      repo.add(isin, "2025-07-14", 120);
      repo.add(isin, "2025-07-11", 105);
      repo.add(isin, "2025-07-10", 100);

      expect(repo.getLatestQuote(isin)?.date).toStrictEqual(
        new Date("2025-07-14")
      );
      expect(repo.getLatestQuote(isin)?.price).toStrictEqual(120.0);
    });

    it("should return undefined when there are no quotes", () => {
      expect(repo.getLatestQuote(isin)).toBeUndefined();

      repo.quotes[isin] = [];
      expect(repo.getLatestQuote(isin)).toBeUndefined();
    });
  });

  describe("toString method", () => {
    it("should correctly construct the string representation for an empty repository", () => {
      expect(repo.toString()).toStrictEqual(
        "> Quotes: 0 ISINs stored, 0 quotes stored\n"
      );
    });
  });

  describe("toJSON/fromJSON methods (serialise/deserialise)", () => {
    it("should correctly serialize and deserialize quotes", () => {
      repo.add(isin, new QuoteItem("2025-07-14", 100));
      repo.add("US0987654321", new QuoteItem("2025-07-15", 110));

      const serialized = JSON.stringify(repo.toJSON());
      const parsed = JSON.parse(serialized);

      expect(parsed[isin][0].date).toStrictEqual("2025-07-14");
      expect(parsed["US0987654321"][0].date).toStrictEqual("2025-07-15");

      const deserialized = QuoteRepository.fromJSON(parsed);

      expect(deserialized.getLatestQuote(isin)?.price).toStrictEqual(100);
      expect(deserialized.getLatestQuote("US0987654321")?.price).toStrictEqual(
        110
      );
    });
  });
});
