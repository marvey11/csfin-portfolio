import { ApplicationRepository } from "./ApplicationRepository";
import { BuyTransaction } from "./BuyTransaction";
import { OperationRepository } from "./OperationRepository";
import { Portfolio } from "./Portfolio";
import { QuoteItem } from "./QuoteItem";
import { QuoteRepository } from "./QuoteRepository";
import { SecurityRepository } from "./SecurityRepository";

describe("Test Suite for the ApplicationRepository class", () => {
  let securities: SecurityRepository;
  let quotes: QuoteRepository;
  let operations: OperationRepository;

  beforeEach(() => {
    securities = new SecurityRepository();
    quotes = new QuoteRepository();
    operations = new OperationRepository();

    securities.add("DE1234567890", "123456", "Fictional Inc.");
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
      // Portfolio.reconstruct is tested separately
      null as unknown as Portfolio
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
        // portfolio not necessary
        null as unknown as Portfolio
      );

      const baseJSON = appRepo.toJSON();
      const object = ApplicationRepository.fromJSON(baseJSON);

      expect(object.securities.toJSON()).toEqual(securities.toJSON());
      expect(object.quotes.toJSON()).toEqual(quotes.toJSON());
      expect(object.operations.toJSON()).toEqual(operations.toJSON());
    });
  });
});
