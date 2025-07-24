import { deserializeOperation } from "../utils/index.js";
import { BuyTransaction } from "./BuyTransaction.js";

describe("Test Suite for the BuyTransaction class", () => {
  let baseBuyTransaction: BuyTransaction;

  beforeEach(() => {
    baseBuyTransaction = new BuyTransaction("2023-01-01", 10, 100, 5);
  });

  describe("constructor", () => {
    it("should correctly initialize properties", () => {
      expect(baseBuyTransaction.date).toEqual(new Date("2023-01-01"));
      expect(baseBuyTransaction.shares).toStrictEqual(10);
      expect(baseBuyTransaction.pricePerShare).toStrictEqual(100);
      expect(baseBuyTransaction.fees).toStrictEqual(5);
    });

    it("should use default values for fees and taxes", () => {
      const tx = new BuyTransaction("2023-01-01", 10, 100);
      expect(tx.fees).toStrictEqual(0);
    });

    it("should throw an error for invalid values", () => {
      expect(() => {
        new BuyTransaction("2023-01-01", -10, 100, 5);
      }).toThrow("Number of shares cannot be negative.");
      expect(() => {
        new BuyTransaction("2023-01-01", 10, -100, 5);
      }).toThrow("Price per share cannot be negative.");
      expect(() => {
        new BuyTransaction("2023-01-01", 10, 100, -5);
      }).toThrow("Fees cannot be negative.");
    });
  });

  describe("clone", () => {
    it("should create an identical but separate instance", () => {
      const clonedTransaction = baseBuyTransaction.clone();

      expect(baseBuyTransaction.shares).toStrictEqual(10);
      expect(baseBuyTransaction.pricePerShare).toStrictEqual(100);

      // Check for value equality but different object reference
      expect(clonedTransaction).not.toBe(baseBuyTransaction);
      expect(clonedTransaction.toJSON()).toEqual(baseBuyTransaction.toJSON());

      expect(clonedTransaction.date).not.toBe(baseBuyTransaction.date);

      expect(clonedTransaction.checksum).toStrictEqual(
        baseBuyTransaction.checksum
      );
    });
  });

  describe("toString", () => {
    it("it should return the correct string representation", () => {
      expect(baseBuyTransaction.toString()).toStrictEqual(
        "BUY 10 shares @ 100"
      );
    });
  });

  describe("serialization (toJSON/fromJSON)", () => {
    it("should correctly perform a round-trip for a BuyTransaction", () => {
      const baseJSON = baseBuyTransaction.toJSON();
      const object = deserializeOperation(baseJSON);
      expect(object.toJSON()).toEqual(baseJSON);
    });
  });
});
