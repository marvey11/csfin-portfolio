import { StockExchange } from "./StockExchange";

describe("Test Suite for StockExchange", () => {
  it("should pass basic tests", () => {
    const exchange = new StockExchange("NASDAQ", "United States");
    expect(exchange.name).toStrictEqual("NASDAQ");
    expect(exchange.country).toStrictEqual("United States");
  });
});
