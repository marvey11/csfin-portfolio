import { ZodError } from "zod";
import { deserializeOperation } from "../utils/index.js";
import { StockSplit } from "./StockSplit.js";

describe("Test Suite for the StockSplit operation class", () => {
  let baseStockSplit: StockSplit;

  beforeEach(() => {
    baseStockSplit = new StockSplit("2023-01-01", 2);
  });

  it("should pass basic tests", () => {
    expect(baseStockSplit.date).toEqual(new Date("2023-01-01"));
    expect(baseStockSplit.splitRatio).toStrictEqual(2);

    expect(baseStockSplit.toString()).toStrictEqual("SPLIT (2)");
  });

  it("should throw an error for invalid values", () => {
    const errorMessage = "Ratio must be greater than zero.";
    expect(() => {
      new StockSplit("2023-01-01", 0);
    }).toThrow(errorMessage);
    expect(() => {
      new StockSplit("2023-01-01", -1);
    }).toThrow(errorMessage);
  });

  it("should clone correctly", () => {
    const clonedStockSplit = baseStockSplit.clone();
    expect(clonedStockSplit).not.toBe(baseStockSplit);
    expect(clonedStockSplit.date).not.toBe(baseStockSplit.date);
    expect(clonedStockSplit.checksum).toStrictEqual(baseStockSplit.checksum);
    expect(clonedStockSplit.toJSON()).toEqual(baseStockSplit.toJSON());
  });

  describe("serialise/deserialise", () => {
    it("should serialise and deserialise correctly", () => {
      const baseJSON = baseStockSplit.toJSON();
      console.log("BASE JSON:", baseJSON);
      const object = deserializeOperation(baseJSON);
      expect(object.toJSON()).toEqual(baseJSON);
    });

    it("should not deserialise incomplete data", () => {
      expect(() => {
        deserializeOperation({ splitRatio: 2 });
      }).toThrow(ZodError);
    });
  });
});
