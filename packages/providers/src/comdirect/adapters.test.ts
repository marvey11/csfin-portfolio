import { convertToTransaction } from "./adapters";
import { RawTransaction } from "./types";

describe("Test Suite for adapters", () => {
  const rt01: RawTransaction = {
    executionDate: "15/07/2025",
    nsin: "123456",
    isin: "DE1234567890",
    name: "Fictional Inc",
    type: "Kauf",
    shares: "10",
    price: "1,000.00",
    currency: "EUR",
    totalFees: "12.34",
    comdirectID: "1234567890",
    exchangeRate: "1.000000",
  };

  const rt02 = { ...rt01, type: "Verkauf" };
  const rt03 = { ...rt01, type: "Invalid" };

  it("should pass basic tests with a BUY transaction", () => {
    const tx = convertToTransaction(rt01);
    expect(tx.date).toStrictEqual(new Date("2025-07-15"));
    expect(tx.exchange).toBeNull();
    expect(tx.fees).toBeCloseTo(12.34, 6);
    expect(tx.quote).toStrictEqual(1000);
    expect(tx.shares).toStrictEqual(10);
    expect(tx.taxes).toStrictEqual(0);
    expect(tx.type).toStrictEqual("BUY");
  });

  it("should pass basic tests with a SELL transaction", () => {
    const tx = convertToTransaction(rt02);
    expect(tx.date).toStrictEqual(new Date("2025-07-15"));
    expect(tx.exchange).toBeNull();
    expect(tx.fees).toBeCloseTo(12.34, 6);
    expect(tx.quote).toStrictEqual(1000);
    expect(tx.shares).toStrictEqual(10);
    expect(tx.taxes).toStrictEqual(0);
    expect(tx.type).toStrictEqual("SELL");
  });

  it("should correctly throw an exception when encountering invalid type", () => {
    expect(() => convertToTransaction(rt03)).toThrow(
      "Invalid raw transaction type: Invalid"
    );
  });
});
