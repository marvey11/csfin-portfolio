import { Transaction } from "./Transaction";

describe("Test Suite for Transaction", () => {
  it("should pass basic tests when using a date string", () => {
    const transaction = new Transaction("2025-07-13", "BUY", 10, 100);
    expect(transaction.date).toStrictEqual(new Date("2025-07-13"));
    expect(transaction.exchange).toBeNull();
    expect(transaction.fees).toStrictEqual(0);
    expect(transaction.quote).toStrictEqual(100);
    expect(transaction.shares).toStrictEqual(10);
    expect(transaction.taxes).toStrictEqual(0);
    expect(transaction.type).toStrictEqual("BUY");
  });

  it("should pass basic tests when using a date object and fees and taxes", () => {
    const transaction = new Transaction(
      new Date("2025-07-13"),
      "BUY",
      10,
      100,
      null,
      12.34,
      10.05
    );
    expect(transaction.date).toStrictEqual(new Date("2025-07-13"));
    expect(transaction.exchange).toBeNull();
    expect(transaction.fees).toBeCloseTo(12.34, 6);
    expect(transaction.quote).toStrictEqual(100);
    expect(transaction.shares).toStrictEqual(10);
    expect(transaction.taxes).toBeCloseTo(10.05, 6);
    expect(transaction.type).toStrictEqual("BUY");
  });

  it("should correctly throw an exception when the date string is invalid", () => {
    expect(() => new Transaction("2025-06-31", "BUY", 10, 100)).toThrow(
      "Invalid date string provided"
    );
  });

  it("should correctly throw an exception when the fees are negative", () => {
    expect(
      () => new Transaction("2025-07-13", "BUY", 10, 100, null, -1)
    ).toThrow("Fees cannot be negative.");
  });
});
