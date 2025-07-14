import { getDateObject } from "../utils";
import { StockExchange } from "./StockExchange";

type TransactionType = "BUY" | "SELL";

class Transaction {
  date: Date;

  type: TransactionType;

  shares: number;

  quote: number;

  exchange: StockExchange | null;

  fees: number;

  taxes: number;

  constructor(
    date: Date | string,
    type: TransactionType,
    shares: number,
    quote: number,
    exchange: StockExchange | null = null,
    fees = 0.0,
    taxes = 0.0
  ) {
    if (fees < 0) {
      throw new Error("Fees cannot be negative.");
    }

    this.date = getDateObject(date);
    this.type = type;
    this.shares = shares;
    this.quote = quote;
    this.exchange = exchange;
    this.fees = fees;
    this.taxes = taxes;
  }
}

export { Transaction };
export type { TransactionType };
