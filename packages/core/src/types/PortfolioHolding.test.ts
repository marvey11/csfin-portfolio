import { BuyTransaction } from "./BuyTransaction";
import { Dividend } from "./Dividend";
import { OperationRepository } from "./OperationRepository";
import { PortfolioHolding } from "./PortfolioHolding";
import { PortfolioOperation } from "./PortfolioOperation";
import { SellTransaction } from "./SellTransaction";
import { StockSplit } from "./StockSplit";
import { SortedList } from "./utility";

describe("Test Suite for the PortfolioHolding class", () => {
  const isin = "DE1234567890";
  const security = {
    isin,
    nsin: "123456",
    name: "Fictional Inc.",
  };

  let holding: PortfolioHolding;

  beforeEach(() => {
    holding = new PortfolioHolding(security);
  });

  it("should pass basic tests", () => {
    expect(holding.security.isin).toStrictEqual("DE1234567890");
    expect(holding.currentBuyTransactions).toHaveLength(0);
    expect(holding.shares).toStrictEqual(0);
    expect(holding.totalRealizedGains).toStrictEqual(0);
    expect(holding.totalFees).toStrictEqual(0);
    expect(holding.totalTaxes).toStrictEqual(0);
  });

  it("should correctly apply transaction operations", () => {
    const tx01 = new BuyTransaction("2023-01-01", 10, 100, 5);
    tx01.apply(holding);

    expect(holding.currentBuyTransactions).toHaveLength(1);
    expect(holding.shares).toStrictEqual(10);
    expect(holding.nominalPurchasePrice).toStrictEqual(1000);
    expect(holding.totalCostBasis).toStrictEqual(1005);
    expect(holding.averagePricePerShare).toBeCloseTo(100.5);
    expect(holding.totalRealizedGains).toStrictEqual(0);
    expect(holding.totalFees).toStrictEqual(5);
    expect(holding.totalTaxes).toStrictEqual(0);

    const tx02 = new BuyTransaction("2023-02-01", 5, 120, 5);
    tx02.apply(holding);

    expect(holding.currentBuyTransactions).toHaveLength(2);
    expect(holding.shares).toStrictEqual(15);
    expect(holding.nominalPurchasePrice).toStrictEqual(1600);
    expect(holding.totalCostBasis).toStrictEqual(1610);
    expect(holding.averagePricePerShare).toBeCloseTo(107.3333333333333);
    expect(holding.totalRealizedGains).toStrictEqual(0);
    expect(holding.totalFees).toStrictEqual(10);
    expect(holding.totalTaxes).toStrictEqual(0);

    const tx03 = new SellTransaction("2024-01-01", 15, 150, 10, 20);
    tx03.apply(holding);

    expect(holding.currentBuyTransactions).toHaveLength(0);
    expect(holding.shares).toStrictEqual(0);
    expect(holding.nominalPurchasePrice).toStrictEqual(0);
    expect(holding.totalCostBasis).toStrictEqual(0);
    expect(holding.averagePricePerShare).toBeCloseTo(0);
    expect(holding.totalRealizedGains).toStrictEqual(650);

    // fees and taxes should be reset, as the position is fully sold
    expect(holding.totalFees).toStrictEqual(0);
    expect(holding.totalTaxes).toStrictEqual(0);
  });

  it("should correctly throw an exception when selling more shares than held", () => {
    const tx = new SellTransaction("2024-01-01", 15, 150, 10, 20);

    expect(() => {
      tx.apply(holding);
    }).toThrow(
      "Cannot sell more shares than are currently in this portfolio holding (ISIN: DE1234567890)"
    );
  });

  it("should correctly apply stock splits", () => {
    const tx01 = new BuyTransaction("2023-01-01", 10, 100);
    tx01.apply(holding);

    const tx02 = new BuyTransaction("2023-02-01", 10, 120);
    tx02.apply(holding);

    expect(holding.shares).toStrictEqual(20);
    expect(holding.averagePricePerShare).toStrictEqual(110);

    const split = new StockSplit("2023-03-01", 2);
    split.apply(holding);

    expect(holding.shares).toStrictEqual(40);
    expect(holding.averagePricePerShare).toStrictEqual(55);
  });

  describe("rebuild from operations", () => {
    let operationsRepo = new OperationRepository();

    beforeEach(() => {
      operationsRepo = new OperationRepository();
      operationsRepo.add(isin, new BuyTransaction("2023-01-01", 10, 100, 5));
      operationsRepo.add(isin, new StockSplit("2023-02-01", 2));
      operationsRepo.add(isin, new Dividend("2023-03-01", 0.06));
    });

    it("should correctly build a holding from operations", () => {
      const consoleLogSpy = vi.spyOn(console, "log").mockImplementation(() => {
        // Do nothing
      });

      const operations = operationsRepo.get(isin);
      expect(operations).toBeDefined();

      const holding = PortfolioHolding.fromOperations(
        security,
        operations as SortedList<PortfolioOperation>
      );

      expect(holding.security.isin).toStrictEqual(isin);
      expect(holding.shares).toStrictEqual(20);
      expect(holding.averagePricePerShare).toBeCloseTo(50.25);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        "Total dividend of €1.20 paid to DE1234567890 on 2023-03-01"
      );
    });
  });
});
