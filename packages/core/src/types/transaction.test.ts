import { StockExchange } from "./exchange";
import { Transaction } from "./transaction";

describe("Transaction", () => {
  let baseTransaction: Transaction;

  beforeEach(() => {
    baseTransaction = new Transaction("2023-01-01", "BUY", 10, 100, 5, 2);
  });

  describe("constructor", () => {
    it("should correctly initialize properties", () => {
      expect(baseTransaction.date).toEqual(new Date("2023-01-01"));
      expect(baseTransaction.transactionType).toBe("BUY");
      expect(baseTransaction.shares).toBe(10);
      expect(baseTransaction.quote).toBe(100);
      expect(baseTransaction.fees).toBe(5);
      expect(baseTransaction.taxes).toBe(2);
      expect(baseTransaction.stockSplits).toEqual([]);
      expect(baseTransaction.stockExchange).toBeNull();
    });

    it("should use default values for fees and taxes", () => {
      const tx = new Transaction("2023-01-01", "BUY", 10, 100);
      expect(tx.fees).toBe(0);
      expect(tx.taxes).toBe(0);
    });

    it("should throw an error for negative fees", () => {
      expect(() => {
        new Transaction("2023-01-01", "BUY", 10, 100, -5);
      }).toThrow("Fees cannot be negative.");
    });
  });

  describe("applyStockSplit", () => {
    it("should adjust shares and quote for splits that happen after the transaction date", () => {
      baseTransaction.applyStockSplit(new Date("2023-02-01"), 2); // 2-for-1 split
      expect(baseTransaction.shares).toBe(20);
      expect(baseTransaction.quote).toBe(50);
      expect(baseTransaction.stockSplits.length).toBe(1);
    });

    it("should not adjust shares and quote for splits that happen before the transaction date", () => {
      baseTransaction.applyStockSplit(new Date("2022-12-31"), 2); // Split date is before tx date
      expect(baseTransaction.shares).toBe(10); // Should not change
      expect(baseTransaction.quote).toBe(100); // Should not change
      expect(baseTransaction.stockSplits.length).toBe(1);
    });

    it("should be idempotent and not apply the same split twice", () => {
      const consoleWarnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => {
          // Do nothing
        });
      const splitDate = new Date("2023-02-01");
      const splitRatio = 2;

      baseTransaction.applyStockSplit(splitDate, splitRatio);
      expect(baseTransaction.shares).toBe(20);

      // Apply the same split again
      baseTransaction.applyStockSplit(splitDate, splitRatio);
      expect(baseTransaction.shares).toBe(20); // Should not change again
      expect(baseTransaction.stockSplits.length).toBe(1);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "Stock split already applied"
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe("clone", () => {
    it("should create an identical but separate instance", () => {
      baseTransaction.stockExchange = { name: "XETRA", country: "DE" };
      baseTransaction.applyStockSplit(new Date("2023-02-01"), 2);

      const clone = baseTransaction.clone();

      // Check for value equality but different object reference
      expect(clone).not.toBe(baseTransaction);
      expect(clone.toJSON()).toEqual(baseTransaction.toJSON());

      // Check for deep copy: modify clone and ensure original is unchanged
      clone.shares = 500;
      (clone.stockExchange as StockExchange).name = "NASDAQ";
      clone.stockSplits[0].splitRatio = 10;

      expect(baseTransaction.shares).toBe(20); // Original shares after split
      expect((baseTransaction.stockExchange as StockExchange).name).toBe(
        "XETRA"
      );
      expect(baseTransaction.stockSplits[0].splitRatio).toBe(2);
    });

    it("should correctly clone when stockExchange is null", () => {
      // baseTransaction.stockExchange is null by default from beforeEach
      const clone = baseTransaction.clone();

      expect(clone).not.toBe(baseTransaction);
      expect(clone.stockExchange).toBeNull();
    });
  });

  describe("serialization (toJSON/fromJSON)", () => {
    it("should correctly perform a round-trip for a complex transaction", () => {
      baseTransaction.stockExchange = { name: "XETRA", country: "DE" };
      baseTransaction.applyStockSplit(new Date("2023-02-01"), 2);

      const json = baseTransaction.toJSON();

      const object = Transaction.fromJSON(json);

      expect(object).toEqual(baseTransaction);
    });
  });
});
