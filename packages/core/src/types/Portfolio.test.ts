import { ApplicationRepository } from "./ApplicationRepository";
import { BuyTransaction } from "./BuyTransaction";
import { OperationRepository } from "./OperationRepository";
import { Portfolio } from "./Portfolio";
import { QuoteRepository } from "./QuoteRepository";
import { SecurityRepository } from "./SecurityRepository";
import { StockSplit } from "./StockSplit";

describe("Test Suite for the Portfolio class", () => {
  const isin01 = "DE1234567890";
  const isin02 = "US0987654321";

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

      const holding02 = portfolio.getHolding(isin02);
      expect(holding02).toBeDefined();
      expect(holding02?.shares).toStrictEqual(20);
      expect(holding02?.averagePricePerShare).toBeCloseTo(110.5);
    });
  });
});
