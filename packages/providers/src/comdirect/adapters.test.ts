import { convertToTransaction } from "./adapters";
import { RawTransaction } from "./types";

describe("Test Suite for adapters", () => {
  const rt: RawTransaction = {
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

  it("should pass basic tests", () => {
    const tx = convertToTransaction(rt);

    expect(tx.date).toStrictEqual(new Date("2025-07-15"));
    expect(tx.exchange).toBeNull();
    expect(tx.fees).toBeCloseTo(12.34, 6);
    expect(tx.quote).toStrictEqual(1000);
    expect(tx.shares).toStrictEqual(10);
    expect(tx.taxes).toStrictEqual(0);
    expect(tx.type).toStrictEqual("BUY");
  });
});
