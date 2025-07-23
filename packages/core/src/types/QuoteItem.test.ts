import { QuoteItem } from "./QuoteItem";

describe("Test Suite for QuoteItem", () => {
  it("should pass basic tests when using a date string", () => {
    const quoteItem = new QuoteItem("2025-07-13", 123.45);
    expect(quoteItem.date).toStrictEqual(new Date("2025-07-13"));
    expect(quoteItem.price).toBeCloseTo(123.45, 6);
  });

  it("should pass basic tests when using a Date object", () => {
    const quoteItem = new QuoteItem(new Date("2025-07-13"), 123.45);
    expect(quoteItem.date).toStrictEqual(new Date("2025-07-13"));
    expect(quoteItem.price).toBeCloseTo(123.45, 6);
  });

  it("should correctly throw exceptions on incorrect date formats", () => {
    const errorString = "Invalid date string provided";
    // semantically incorrect date
    expect(() => new QuoteItem("2023-02-29", 123.45)).toThrow(errorString);
    // not a date string at all
    expect(() => new QuoteItem("", 123.45)).toThrow(errorString);
    // incorrect format
    expect(() => new QuoteItem("2025-7-13", 123.45)).toThrow(errorString);
  });
});
