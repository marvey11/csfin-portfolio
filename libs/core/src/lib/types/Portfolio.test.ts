import { ApplicationRepository } from "./ApplicationRepository.js";
import { BuyTransaction } from "./BuyTransaction.js";
import { OperationRepository } from "./OperationRepository.js";
import { Portfolio } from "./Portfolio.js";
import { QuoteRepository } from "./QuoteRepository.js";
import { SecurityRepository } from "./SecurityRepository.js";
import { SellTransaction } from "./SellTransaction.js";
import { StockSplit } from "./StockSplit.js";

describe("Test Suite for the Portfolio class", () => {
  const isin01 = "DE1234567890";
  const isin02 = "US0987654321";

  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleWarnSpy = jest.spyOn(console, "warn");
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  it("should pass basic tests", () => {
    const portfolio = new Portfolio();

    expect(portfolio.getHolding(isin01)).toBeUndefined();
  });

  describe("rebuild from operations", () => {
    let appdata: ApplicationRepository;
    let operationsRepo: OperationRepository;
    let securitiesRepo: SecurityRepository;
    let quotesRepo: QuoteRepository;

    beforeEach(() => {
      operationsRepo = new OperationRepository();

      operationsRepo.add(isin01, new BuyTransaction("2023-01-01", 10, 100, 5));
      operationsRepo.add(isin01, new StockSplit("2023-01-01", 2));

      operationsRepo.add(isin02, new BuyTransaction("2024-01-01", 10, 100, 5));
      operationsRepo.add(isin02, new BuyTransaction("2024-07-01", 10, 120, 5));
      operationsRepo.add(
        isin02,
        new SellTransaction("2024-08-01", 20, 125, 5, 10)
      );

      securitiesRepo = new SecurityRepository();

      securitiesRepo.add({
        isin: isin01,
        nsin: "123456",
        name: "Fictional Inc.",
        country: "Germany",
        countryCode: "DE",
        currency: "EUR",
      });
      securitiesRepo.add({
        isin: isin02,
        nsin: "654321",
        name: "Fictional Corp.",
        country: "United States",
        countryCode: "US",
        currency: "USD",
      });

      quotesRepo = new QuoteRepository();

      appdata = new ApplicationRepository(
        securitiesRepo,
        quotesRepo,
        operationsRepo
      );
    });

    it("should correctly build a holding from operations", () => {
      const portfolio = Portfolio.reconstruct(appdata);

      const holding01 = portfolio.getHolding(isin01);
      expect(holding01).toBeDefined();
      expect(holding01?.shares).toStrictEqual(20);
      expect(holding01?.averagePricePerShare).toBeCloseTo(50.25);
      expect(holding01?.totalRealizedGains).toBeCloseTo(0);

      const holding02 = portfolio.getHolding(isin02);
      expect(holding02).toBeDefined();
      // holding has been sold off
      expect(holding02?.shares).toStrictEqual(0);
      expect(holding02?.averagePricePerShare).toBeCloseTo(0);
      expect(holding02?.totalRealizedGains).toBeCloseTo(275);

      expect(portfolio.getActiveHoldings()).toHaveLength(1);
      expect(portfolio.totalCostBasis).toBeCloseTo(1005);

      // fees for the second holding should not be counted here
      // --> they will be counted in the realised gains instead
      expect(portfolio.totalFees).toBeCloseTo(5);

      expect(portfolio.totalRealizedGains).toBeCloseTo(275);

      expect(portfolio.totalDividends).toStrictEqual(0);
    });

    it("should not a holding for an unknown security", () => {
      operationsRepo.add(
        "FR1234567890",
        new BuyTransaction("2024-01-01", 10, 100, 5)
      );

      const portfolio = Portfolio.reconstruct(appdata);

      expect(portfolio.getAllHoldings()).toHaveLength(2);

      expect(portfolio.getHolding(isin01)).toBeDefined();
      expect(portfolio.getHolding(isin02)).toBeDefined();

      expect(portfolio.getHolding("FR1234567890")).toBeUndefined();

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "Security with ISIN FR1234567890 not found in the repository. Ignoring..."
      );
    });
  });
});
