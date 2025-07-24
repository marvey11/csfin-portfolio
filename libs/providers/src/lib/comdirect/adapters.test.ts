import { QuoteItem } from "@csfin-portfolio/core";
import { convertToQuoteData, convertToTransaction } from "./adapters.js";
import { RawTransaction } from "./types/index.js";

describe("Test Suite for adapters", () => {
  describe("Test Suite for convertToTransaction", () => {
    const rt: RawTransaction = {
      executionDate: "15/07/2025",
      nsin: "123456",
      isin: "DE1234567890",
      name: "Fictional Inc",
      type: "Kauf",
      shares: "10",
      price: "1,000.00",
      currency: "EUR",
      totalFees: "12.34",
      comdirectID: "1234567890",
      exchangeRate: "1.000000",
    };

    it("should pass basic tests with a BUY transaction", () => {
      const tx = convertToTransaction(rt);
      expect(tx.date).toStrictEqual(new Date("2025-07-15"));
      expect(tx.fees).toBeCloseTo(12.34, 6);
      expect(tx.pricePerShare).toStrictEqual(1000);
      expect(tx.shares).toStrictEqual(10);
      expect(tx.taxes).toStrictEqual(0);
    });

    it("should pass basic tests with a SELL transaction", () => {
      const tx = convertToTransaction({ ...rt, type: "Verkauf" });
      expect(tx.date).toStrictEqual(new Date("2025-07-15"));
      expect(tx.fees).toBeCloseTo(12.34, 6);
      expect(tx.pricePerShare).toStrictEqual(1000);
      expect(tx.shares).toStrictEqual(10);
      expect(tx.taxes).toStrictEqual(0);
    });

    it("should correctly throw an exception when encountering invalid type", () => {
      expect(() => convertToTransaction({ ...rt, type: "Invalid" })).toThrow(
        "Invalid raw transaction type: Invalid"
      );
    });
  });

  describe("Test Suite for convertToQuoteData", () => {
    const rawQuoteData = {
      name: "Fictional Inc",
      nsin: "123456",
      exchange: "Fictional Exchange",
      items: [
        {
          date: "15/07/2025",
          price: "1,000.00",
        },
        {
          date: "16/07/2025",
          price: "1,050.00",
        },
      ],
    };

    it("should pass basic tests", () => {
      const quoteData = convertToQuoteData(rawQuoteData);

      expect(quoteData.name).toStrictEqual("Fictional Inc");
      expect(quoteData.nsin).toStrictEqual("123456");
      expect(quoteData.exchange).toStrictEqual("Fictional Exchange");

      expect(quoteData.items).toHaveLength(2);

      const item0 = quoteData.items[0] as QuoteItem;
      const item1 = quoteData.items[1] as QuoteItem;

      expect(item0.date).toStrictEqual(new Date("2025-07-15"));
      expect(item0.price).toStrictEqual(1000);

      expect(item1.date).toStrictEqual(new Date("2025-07-16"));
      expect(item1.price).toStrictEqual(1050);
    });
  });
});
