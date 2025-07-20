import { TransactionType } from "../transaction";
import { StockExchangeJSON } from "./exchange";
import { StockSplitJSON } from "./stocksplit";

interface TransactionJSON {
  date: string;
  type: TransactionType;
  shares: number;
  quote: number;
  fees: number;
  taxes: number;
  stockSplits: StockSplitJSON[];
  stockExchange?: StockExchangeJSON | null;
}

const isTransactionJSON = (obj: unknown): obj is TransactionJSON => {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }

  const potential = obj as { [key: string]: unknown };

  return (
    "date" in potential &&
    typeof potential.date === "string" &&
    "type" in potential &&
    typeof potential.type === "string" &&
    "shares" in potential &&
    typeof potential.shares === "number" &&
    "quote" in potential &&
    typeof potential.quote === "number" &&
    "fees" in potential &&
    typeof potential.fees === "number" &&
    "taxes" in potential &&
    typeof potential.taxes === "number"
  );
};

interface TransactionRepositoryJSON {
  [key: string]: TransactionJSON[];
}

const isTransactionRepositoryJSON = (
  data: unknown
): data is TransactionRepositoryJSON => {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const potential = data as { [key: string]: unknown };

  return Object.entries(potential).every(
    ([key, value]) =>
      typeof key === "string" &&
      Array.isArray(value) &&
      value.every(isTransactionJSON)
  );
};

export { isTransactionJSON, isTransactionRepositoryJSON };
export type { TransactionJSON, TransactionRepositoryJSON };
