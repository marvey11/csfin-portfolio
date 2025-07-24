import { ZodError } from "zod";
import { deserializeOperation } from "../utils/index.js";
import { Dividend } from "./Dividend.js";

describe("Test Suite for the Dividend operataion class", () => {
  let baseDividend: Dividend;

  beforeEach(() => {
    baseDividend = new Dividend("2023-01-01", 100, 10);
  });

  it("should pass basic tests", () => {
    expect(baseDividend.date).toEqual(new Date("2023-01-01"));
    expect(baseDividend.dividendPerShare).toStrictEqual(100);
    expect(baseDividend.toString()).toStrictEqual("DIVIDEND (100)");
  });

  it("should throw an error for invalid values", () => {
    const errorMessage = "Dividend per share must be greater than zero.";

    expect(() => {
      new Dividend("2023-01-01", 0, 10);
    }).toThrow(errorMessage);
    expect(() => {
      new Dividend("2023-01-01", -1, 10);
    }).toThrow(errorMessage);
  });

  it("should clone correctly", () => {
    const clonedStockSplit = baseDividend.clone();
    expect(clonedStockSplit).not.toBe(baseDividend);
    expect(clonedStockSplit.date).not.toBe(baseDividend.date);
    expect(clonedStockSplit.checksum).toStrictEqual(baseDividend.checksum);
    expect(clonedStockSplit.toJSON()).toEqual(baseDividend.toJSON());
  });

  describe("serialise/deserialise", () => {
    it("should serialise and deserialise correctly", () => {
      const baseJSON = baseDividend.toJSON();
      const object = deserializeOperation(baseJSON);
      expect(object.toJSON()).toEqual(baseJSON);
    });

    it("should not deserialise incomplete data", () => {
      expect(() => {
        deserializeOperation({ dividendPerShare: 100 });
      }).toThrow(ZodError);
    });
  });
});
