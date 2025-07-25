import { ApplicationRepository } from "./ApplicationRepository.js";
import { BuyTransaction } from "./BuyTransaction.js";
import { OperationRepository } from "./OperationRepository.js";
import { QuoteItem } from "./QuoteItem.js";
import { QuoteRepository } from "./QuoteRepository.js";
import { SecurityRepository } from "./SecurityRepository.js";
import { TaxRepository } from "./TaxRepository.js";

describe("Test Suite for the ApplicationRepository class", () => {
  let securities: SecurityRepository;
  let quotes: QuoteRepository;
  let operations: OperationRepository;
  let taxData: TaxRepository;

  beforeEach(() => {
    securities = new SecurityRepository();
    quotes = new QuoteRepository();
    operations = new OperationRepository();
    taxData = new TaxRepository();

    securities.add({
      isin: "DE1234567890",
      nsin: "123456",
      name: "Fictional Inc.",
      country: "Germany",
      countryCode: "DE",
    });
    quotes.add("DE1234567890", new QuoteItem("2023-01-01", 100));
    operations.add(
      "DE1234567890",
      new BuyTransaction("2023-01-01", 10, 100, 5)
    );
  });

  it("should pass basic tests", () => {
    const appRepo = new ApplicationRepository(
      securities,
      quotes,
      operations,
      taxData
    );

    expect(appRepo.securities).toBe(securities);
    expect(appRepo.quotes).toBe(quotes);
    expect(appRepo.operations).toBe(operations);
  });

  describe("serialise/deserialise", () => {
    it("should serialise and deserialise correctly", () => {
      const appRepo = new ApplicationRepository(
        securities,
        quotes,
        operations,
        taxData
      );

      const baseJSON = appRepo.toJSON();
      console.log(JSON.stringify(baseJSON, null, 2));
      const object = ApplicationRepository.fromJSON(baseJSON);

      expect(object.securities.toJSON()).toEqual(securities.toJSON());
      expect(object.quotes.toJSON()).toEqual(quotes.toJSON());
      expect(object.operations.toJSON()).toEqual(operations.toJSON());
      expect(object.taxData.toJSON()).toEqual(taxData.toJSON());
    });
  });
});
