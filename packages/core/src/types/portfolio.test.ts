import { Portfolio, StockExchange, Transaction } from ".";
import { PortfolioPosition } from "./portfolio";
import { Security } from "./security";

describe("Test Suite for the portfolio types", () => {
  const security = new Security("DE1234567890", "123456", "Fictional Inc.");
  const exchange = new StockExchange("XETRA", "Germany");

  describe("Test Suite for the PortfolioPosition class", () => {
    it("should pass basic tests", () => {
      const item = new PortfolioPosition(security);
      expect(item.security).toStrictEqual(
        new Security("DE1234567890", "123456", "Fictional Inc.")
      );
      expect(item.getTransactions()).toHaveLength(0);
      expect(item.getCurrentShares()).toStrictEqual(0);
      expect(item.getCurrentBuyValue()).toStrictEqual(0);
      expect(item.getCurrentAveragePrice()).toStrictEqual(0);
      expect(item.getRealizedGains("gross")).toStrictEqual(0);
      expect(item.getRealizedGains("net")).toStrictEqual(0);
    });

    it("should pass tests related to adding transactions", () => {
      const item = new PortfolioPosition(security);

      item.addTransaction(
        new Transaction("2024-07-13", "BUY", 5, 100, exchange)
      );
      item.addTransaction(
        new Transaction("2024-08-13", "BUY", 5, 100, exchange)
      );

      expect(item.getTransactions()).toHaveLength(2);
      expect(item.getCurrentShares()).toStrictEqual(10);
      expect(item.getCurrentBuyValue()).toStrictEqual(1000);
      expect(item.getCurrentAveragePrice()).toStrictEqual(100);
      // we haven't sold anything yet
      expect(item.getRealizedGains("gross")).toStrictEqual(0);
      expect(item.getRealizedGains("net")).toStrictEqual(0);

      item.addTransaction(
        new Transaction("2025-07-13", "SELL", 10, 120, exchange)
      );

      expect(item.getTransactions()).toHaveLength(3);
      expect(item.getCurrentShares()).toStrictEqual(0);
      expect(item.getCurrentBuyValue()).toStrictEqual(0);
      expect(item.getCurrentAveragePrice()).toStrictEqual(0);
      // gross and net should be the same as we haven't specified fees or taxes
      expect(item.getRealizedGains("gross")).toStrictEqual(200);
      expect(item.getRealizedGains("net")).toStrictEqual(200);
    });

    it("should pass tests when including fees and taxes", () => {
      const item = new PortfolioPosition(security);

      item.addTransaction(
        new Transaction("2024-07-13", "BUY", 5, 100, exchange, 10)
      );
      item.addTransaction(
        new Transaction("2024-08-13", "BUY", 5, 100, exchange, 10)
      );
      item.addTransaction(
        new Transaction("2025-07-13", "SELL", 10, 120, exchange, 20, 50)
      );

      // gross gain should still be the same
      expect(item.getRealizedGains("gross")).toStrictEqual(200);
      // net gain should be diminished by 90 (accumulated 40 for fees and 50 for taxes)
      expect(item.getRealizedGains("net")).toStrictEqual(110);
    });

    it("should correctly throw an exception if we are trying to sell more shares than available", () => {
      const item = new PortfolioPosition(security);

      expect(() =>
        item.addTransaction(
          new Transaction("2025-07-13", "SELL", 10, 120, exchange)
        )
      ).toThrow(
        "Cannot sell more shares than are currently in this portfolio position!"
      );
    });
  });

  describe("Test Suite for the Portfolio class", () => {
    it("should pass basic tests", () => {
      const item = new Portfolio();

      item.addTransaction(
        security,
        new Transaction("2024-07-13", "BUY", 5, 100, exchange)
      );
      item.addTransaction(
        security,
        new Transaction("2024-08-13", "BUY", 5, 100, exchange)
      );
      item.addTransaction(
        security,
        new Transaction("2025-07-13", "SELL", 10, 120, exchange)
      );

      expect(item.getAllPositions()).toHaveLength(1);

      // test different ways to access the position
      expect(item.getPosition(security)).toBeDefined();
      expect(item.getPosition(security.isin)).toBeDefined();

      // test several ways to access the transactions via the position
      expect(item.getPosition(security)?.getTransactions()).toHaveLength(3);
      expect(item.getPosition(security.isin)?.getTransactions()).toHaveLength(
        3
      );

      // gross and net should be the same as we haven't specified fees or taxes
      expect(item.getRealizedGains("gross")).toStrictEqual(200);
      expect(item.getRealizedGains("net")).toStrictEqual(200);
    });
  });
});
