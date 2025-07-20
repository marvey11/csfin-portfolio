import { Portfolio, StockSplitRepository, Transaction } from ".";
import { PortfolioHolding } from "./portfolio";
import { Security } from "./security";

describe("Test Suite for the portfolio types", () => {
  const security: Security = {
    isin: "DE1234567890",
    nsin: "123456",
    name: "Fictional Inc.",
  };
  const exchange = { name: "XETRA", country: "Germany" };

  describe("Test Suite for the PortfolioHolding class", () => {
    it("should pass basic tests", () => {
      const item = new PortfolioHolding(security);
      expect(item.security).toStrictEqual({
        isin: "DE1234567890",
        nsin: "123456",
        name: "Fictional Inc.",
      });
      expect(item.getTransactions()).toHaveLength(0);
      expect(item.getCurrentShares()).toStrictEqual(0);
      expect(item.getCurrentBuyValue()).toStrictEqual(0);
      expect(item.getCurrentAveragePrice()).toStrictEqual(0);
      expect(item.getRealizedGains("gross")).toStrictEqual(0);
      expect(item.getRealizedGains("net")).toStrictEqual(0);
    });

    it("should pass tests related to adding transactions", () => {
      const item = new PortfolioHolding(security);

      const tx1 = new Transaction("2024-07-13", "BUY", 5, 100);
      tx1.stockExchange = exchange;
      item.addTransaction(tx1);

      const tx2 = new Transaction("2024-08-13", "BUY", 5, 100);
      tx2.stockExchange = exchange;
      item.addTransaction(tx2);

      expect(item.getTransactions()).toHaveLength(2);
      expect(item.getCurrentShares()).toStrictEqual(10);
      expect(item.getCurrentBuyValue()).toStrictEqual(1000);
      expect(item.getCurrentAveragePrice()).toStrictEqual(100);
      // we haven't sold anything yet
      expect(item.getRealizedGains("gross")).toStrictEqual(0);
      expect(item.getRealizedGains("net")).toStrictEqual(0);

      const tx3 = new Transaction("2025-07-13", "SELL", 10, 120);
      tx3.stockExchange = exchange;
      item.addTransaction(tx3);

      expect(item.getTransactions()).toHaveLength(3);
      expect(item.getCurrentShares()).toStrictEqual(0);
      expect(item.getCurrentBuyValue()).toStrictEqual(0);
      expect(item.getCurrentAveragePrice()).toStrictEqual(0);
      // gross and net should be the same as we haven't specified fees or taxes
      expect(item.getRealizedGains("gross")).toStrictEqual(200);
      expect(item.getRealizedGains("net")).toStrictEqual(200);
    });

    it("should pass tests when including fees and taxes", () => {
      const item = new PortfolioHolding(security);

      const tx1 = new Transaction("2024-07-13", "BUY", 5, 100, 10);
      tx1.stockExchange = exchange;
      item.addTransaction(tx1);

      const tx2 = new Transaction("2024-08-13", "BUY", 5, 100, 10);
      tx2.stockExchange = exchange;
      item.addTransaction(tx2);

      const tx3 = new Transaction("2025-07-13", "SELL", 10, 120, 20, 50);
      tx3.stockExchange = exchange;
      item.addTransaction(tx3);

      expect(item.getTransactions()).toHaveLength(3);

      // gross gain should still be the same
      expect(item.getRealizedGains("gross")).toStrictEqual(200);
      // net gain should be diminished by 90 (accumulated 40 for fees and 50 for taxes)
      expect(item.getRealizedGains("net")).toStrictEqual(110);
    });

    it("should correctly throw an exception if we are trying to sell more shares than available", () => {
      const item = new PortfolioHolding(security);

      const tx1 = new Transaction("2025-07-13", "SELL", 10, 120);
      tx1.stockExchange = exchange;

      expect(() => item.addTransaction(tx1)).toThrow(
        "Cannot sell more shares than are currently in this portfolio holding (ISIN: DE1234567890)"
      );
    });
  });

  describe("Test Suite for the Portfolio class", () => {
    it("should pass basic tests", () => {
      const item = new Portfolio(new StockSplitRepository());

      const tx1 = new Transaction("2024-07-13", "BUY", 5, 100);
      tx1.stockExchange = exchange;
      item.addTransaction(security, tx1);

      const tx2 = new Transaction("2024-08-13", "BUY", 5, 100);
      tx2.stockExchange = exchange;
      item.addTransaction(security, tx2);

      const tx3 = new Transaction("2025-07-13", "SELL", 10, 120);
      tx3.stockExchange = exchange;
      item.addTransaction(security, tx3);

      expect(item.getAllHoldings()).toHaveLength(1);

      // test different ways to access the holding
      expect(item.getHolding(security)).toBeDefined();
      expect(item.getHolding(security.isin)).toBeDefined();

      // test several ways to access the transactions via the holding
      expect(item.getHolding(security)?.getTransactions()).toHaveLength(3);
      expect(item.getHolding(security.isin)?.getTransactions()).toHaveLength(3);

      // gross and net should be the same as we haven't specified fees or taxes
      expect(item.getRealizedGains("gross")).toStrictEqual(200);
      expect(item.getRealizedGains("net")).toStrictEqual(200);
    });
  });
});
