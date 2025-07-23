import { ZodError } from "zod";
import { BuyTransaction } from "./BuyTransaction";
import { OperationRepository } from "./OperationRepository";
import { StockSplit } from "./StockSplit";

describe("Test Suite for the OperationRepository class", () => {
  let repo: OperationRepository;

  beforeEach(() => {
    repo = new OperationRepository();
  });

  it("should pass basic tests", () => {
    expect(repo.data).toEqual({});
    expect(repo.get("DE1234567890")).toBeUndefined();
  });

  it("should be able to add operations", () => {
    repo.add("DE1234567890", new BuyTransaction("2023-01-01", 10, 100, 5));
    repo.add("DE1234567890", new StockSplit("2023-01-01", 2));

    const list = repo.get("DE1234567890");
    expect(list).toBeDefined();
    expect(list?.size).toStrictEqual(2);
  });

  describe("serialise/deserialise", () => {
    it("should serialise and deserialise correctly", () => {
      repo.add("DE1234567890", new BuyTransaction("2023-01-01", 10, 100, 5));
      repo.add("DE1234567890", new StockSplit("2023-01-01", 2));

      const baseJSON = repo.toJSON();
      const object = OperationRepository.fromJSON(baseJSON);
      expect(object.toJSON()).toEqual(baseJSON);
    });

    it("should not deserialise invalid data", () => {
      expect(() => OperationRepository.fromJSON(null)).toThrow(ZodError);
      expect(() => OperationRepository.fromJSON(undefined)).toThrow(ZodError);
      expect(() => OperationRepository.fromJSON(0)).toThrow(ZodError);
      expect(() => OperationRepository.fromJSON({ invalid: "data" })).toThrow(
        ZodError
      );
    });
  });
});
