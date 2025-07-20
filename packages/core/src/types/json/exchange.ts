import { StockExchange } from "../exchange";

type StockExchangeJSON = StockExchange;

const isStockExchangeJSON = (data: unknown): data is StockExchangeJSON => {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const potential = data as { [key: string]: unknown };

  return (
    "name" in potential &&
    typeof potential.name === "string" &&
    "country" in potential &&
    typeof potential.country === "string"
  );
};

export { isStockExchangeJSON };
export type { StockExchangeJSON };
