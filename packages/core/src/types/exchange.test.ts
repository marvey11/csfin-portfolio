import { StockExchange } from "./exchange";

describe("Test Suite for StockExchange", () => {
  it("should pass basic tests", () => {
    const exchange: StockExchange = {
      name: "NASDAQ",
      country: "United States",
    };
    expect(exchange.name).toStrictEqual("NASDAQ");
    expect(exchange.country).toStrictEqual("United States");
  });
});
