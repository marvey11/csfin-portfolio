import { BuyTransaction } from "./BuyTransaction.js";
import { Dividend } from "./Dividend.js";
import { OperationRepository } from "./OperationRepository.js";
import { PortfolioHolding } from "./PortfolioHolding.js";
import { PortfolioOperation } from "./PortfolioOperation.js";
import { Security } from "./Security.js";
import { SellTransaction } from "./SellTransaction.js";
import { StockSplit } from "./StockSplit.js";
import { SortedList } from "./utility/index.js";

describe("Test Suite for the PortfolioHolding class", () => {
  const isin = "DE1234567890";
  const security: Security = {
    isin,
    nsin: "123456",
    name: "Fictional Inc.",
    country: "Germany",
    countryCode: "DE",
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

  it("should correctly apply fees and taxes", () => {
    const tx01 = new BuyTransaction("2023-01-01", 10, 100, 5);
    tx01.apply(holding);

    expect(holding.totalFees).toBeCloseTo(5);
    expect(holding.totalTaxes).toBeCloseTo(0);

    const tx02 = new BuyTransaction("2023-02-01", 10, 120, 5);
    tx02.apply(holding);

    expect(holding.totalFees).toBeCloseTo(10);
    expect(holding.totalTaxes).toBeCloseTo(0);

    const tx03 = new SellTransaction("2024-01-01", 15, 150, 10, 15);
    tx03.apply(holding);

    expect(holding.totalFees).toBeCloseTo(20);
    expect(holding.totalTaxes).toBeCloseTo(15);

    const tx04 = new SellTransaction("2024-02-01", 5, 160, 5, 2);
    tx04.apply(holding);

    const nominalGains = -10 * 100 - 10 * 120 + 15 * 150 + 5 * 160;

    const totalFees = 5 + 5 + 10 + 5;
    const totalTaxes = 15 + 2;

    // realised gains should be nominal gains minus fees and taxes
    expect(holding.totalRealizedGains).toBeCloseTo(
      nominalGains - totalFees - totalTaxes
    );

    // fees and taxes should now be reset since the holding is sold off and the fees and taxes have
    // been absorbed by the gains
    expect(holding.totalFees).toBeCloseTo(0);
    expect(holding.totalTaxes).toBeCloseTo(0);
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

    // nominal gain of 650, but needs to be decresed by fees (20) and taxes (20)
    expect(holding.totalRealizedGains).toStrictEqual(610);

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
      operationsRepo.add(isin, new Dividend("2023-03-01", 0.06, 20));
    });

    it("should correctly build a holding from operations", () => {
      const operations = operationsRepo.get(isin);
      expect(operations).toBeDefined();

      const holding = PortfolioHolding.fromOperations(
        security,
        operations as SortedList<PortfolioOperation>
      );

      expect(holding.security.isin).toStrictEqual(isin);
      expect(holding.shares).toStrictEqual(20);
      expect(holding.averagePricePerShare).toBeCloseTo(50.25);
      expect(holding.totalDividends).toBeCloseTo(1.2);
    });
  });
});
