import { isStockSplitJSON, StockSplitJSON } from "./stocksplit";
import { isTransactionJSON, TransactionJSON } from "./transaction";

interface PortfolioHoldingJSON {
  isin: string;
  transactions: TransactionJSON[];
  stockSplits: StockSplitJSON[];
}

const isPortfolioHoldingJSON = (
  data: unknown
): data is PortfolioHoldingJSON => {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const potential = data as { [key: string]: unknown };

  return (
    "isin" in potential &&
    typeof potential.isin === "string" &&
    "transactions" in potential &&
    Array.isArray(potential.transactions) &&
    potential.transactions.every(isTransactionJSON) &&
    "stockSplits" in potential &&
    Array.isArray(potential.stockSplits) &&
    potential.stockSplits.every(isStockSplitJSON)
  );
};

interface PortfolioJSON {
  holdings: PortfolioHoldingJSON[];
}

const isPortfolioJSON = (data: unknown): data is PortfolioJSON => {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const potential = data as { [key: string]: unknown };

  return (
    "holdings" in potential &&
    Array.isArray(potential.holdings) &&
    potential.holdings.every(isPortfolioHoldingJSON)
  );
};

export { isPortfolioHoldingJSON, isPortfolioJSON };
export type { PortfolioHoldingJSON, PortfolioJSON };
