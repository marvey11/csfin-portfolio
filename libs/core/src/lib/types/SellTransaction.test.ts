import { deserializeOperation } from "../utils/index.js";
import { SellTransaction } from "./SellTransaction.js";

describe("Test Suite for the SellTransaction class", () => {
  let baseSellTransaction: SellTransaction;

  beforeEach(() => {
    baseSellTransaction = new SellTransaction("2023-01-01", 10, 100, 5, 2);
  });

  describe("constructor", () => {
    it("should correctly initialize properties", () => {
      expect(baseSellTransaction.date).toEqual(new Date("2023-01-01"));
      expect(baseSellTransaction.shares).toStrictEqual(10);
      expect(baseSellTransaction.pricePerShare).toStrictEqual(100);
      expect(baseSellTransaction.fees).toStrictEqual(5);
    });

    it("should use default values for fees and taxes", () => {
      const tx = new SellTransaction("2023-01-01", 10, 100);
      expect(tx.fees).toStrictEqual(0);
      expect(tx.taxes).toStrictEqual(0);
    });

    it("should throw an error for invalid values", () => {
      expect(() => {
        new SellTransaction("2023-01-01", -10, 100, 5, 2);
      }).toThrow("Number of shares cannot be negative.");
      expect(() => {
        new SellTransaction("2023-01-01", 10, -100, 5, 2);
      }).toThrow("Price per share cannot be negative.");
      expect(() => {
        new SellTransaction("2023-01-01", 10, 100, -5, 2);
      }).toThrow("Fees cannot be negative.");
      expect(() => {
        new SellTransaction("2023-01-01", 10, 100, 5, -2);
      }).toThrow("Taxes cannot be negative.");
    });
  });

  describe("clone", () => {
    it("should create an identical but separate instance", () => {
      const clonedTransaction = baseSellTransaction.clone();

      expect(baseSellTransaction.shares).toStrictEqual(10);
      expect(baseSellTransaction.pricePerShare).toStrictEqual(100);

      // Check for value equality but different object reference
      expect(clonedTransaction).not.toBe(baseSellTransaction);
      expect(clonedTransaction.toJSON()).toEqual(baseSellTransaction.toJSON());

      expect(clonedTransaction.date).not.toBe(baseSellTransaction.date);

      expect(clonedTransaction.checksum).toStrictEqual(
        baseSellTransaction.checksum
      );
    });
  });

  describe("toString", () => {
    it("it should return the correct string representation", () => {
      expect(baseSellTransaction.toString()).toStrictEqual(
        "SELL 10 shares @ 100"
      );
    });
  });

  describe("serialization (toJSON/fromJSON)", () => {
    it("should correctly perform a round-trip for a SellTransaction", () => {
      const baseJSON = baseSellTransaction.toJSON();
      const object = deserializeOperation(baseJSON);
      expect(object.toJSON()).toEqual(baseJSON);
    });
  });
});
