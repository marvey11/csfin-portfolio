import { formatNormalizedDate, getDateObject } from "../utils";
import { StockExchange } from "./exchange";
import {
  isStockExchangeJSON,
  isTransactionJSON,
  isTransactionRepositoryJSON,
  TransactionRepositoryJSON,
} from "./json";
import { StockSplit } from "./stocksplit";

/**
 * Defines the type of a transaction, which can either be a 'BUY' or a 'SELL' operation.
 */
type TransactionType = "BUY" | "SELL";

/**
 * Represents a single financial transaction, such as buying or selling a security.
 */
class Transaction {
  static fromJSON(data: unknown): Transaction {
    if (!isTransactionJSON(data)) {
      throw new Error("Invalid transaction data");
    }

    const tx = new Transaction(
      getDateObject(data.date),
      data.type as TransactionType,
      data.shares,
      data.quote,
      data.fees,
      data.taxes
    );

    const potentialExchange = data.stockExchange;
    if (isStockExchangeJSON(potentialExchange)) {
      const { name, country } = potentialExchange;
      tx.stockExchange = { name, country };
    } else {
      tx.stockExchange = null;
    }

    if (data.stockSplits && Array.isArray(data.stockSplits)) {
      // stock splits have already been applied and therefore only need to be added back
      tx.stockSplits.push(...data.stockSplits.map(StockSplit.fromJSON));
    }

    return tx;
  }

  /** The date of the transaction. */
  readonly date: Date;

  /** The type of the transaction ('BUY' or 'SELL'). */
  transactionType: TransactionType;

  /** The number of shares involved in the transaction. */
  shares: number;

  /** The price per share at the time of the transaction. */
  quote: number;

  /** Any fees associated with the transaction. */
  fees: number;

  /**
   * Any taxes associated with the transaction.
   * Can be negative in the case of tax refunds.
   */
  taxes: number;

  /** A list of stock splits that have been applied to this transaction. */
  readonly stockSplits: StockSplit[];

  /** The stock exchange where the transaction took place. Can be null. */
  stockExchange?: StockExchange | null;

  /**
   * Creates an instance of a Transaction.
   * @param date The date of the transaction. Can be a Date object or an ISO date string.
   * @param type The type of transaction ('BUY' or 'SELL').
   * @param shares The number of shares.
   * @param quote The price per share.
   * @param fees Any fees associated with the transaction. Defaults to 0.
   * @param taxes Any taxes associated with the transaction. Defaults to 0.
   * @throws {Error} If fees are negative.
   */
  constructor(
    date: Date | string,
    type: TransactionType,
    shares: number,
    quote: number,
    fees = 0.0,
    taxes = 0.0
  ) {
    if (fees < 0) {
      throw new Error("Fees cannot be negative.");
    }

    this.date = getDateObject(date);
    this.transactionType = type;
    this.shares = shares;
    this.quote = quote;
    this.fees = fees;
    this.taxes = taxes;

    this.stockSplits = [];

    this.stockExchange = null;
  }

  applyStockSplits(stockSplits: StockSplit[]): void {
    for (const split of stockSplits) {
      this.applyStockSplit(split.splitDate, split.splitRatio);
    }
  }

  /**
   * Applies a stock split to the transaction.
   * Adjusts the number of shares and the quote if the split occurs after the transaction date.
   * The split is not applied if it has already been recorded.
   * @param splitDate The date of the stock split.
   * @param splitRatio The ratio of the split (e.g., 2 for a 2-for-1 split).
   */
  applyStockSplit(splitDate: Date, splitRatio: number) {
    const stockSplit = new StockSplit(splitDate, splitRatio);

    if (
      this.stockSplits.some((split) => split.checksum === stockSplit.checksum)
    ) {
      console.warn("Stock split already applied");
      return;
    }

    if (this.date < splitDate) {
      this.shares *= splitRatio;
      this.quote /= splitRatio;
    }

    this.stockSplits.push(stockSplit);
  }

  /**
   * Creates a deep clone of the transaction instance.
   * This ensures that modifications to the clone do not affect the original transaction.
   * @returns A new Transaction instance that is a deep copy of the original.
   */
  clone(): Transaction {
    const tx = new Transaction(
      this.date,
      this.transactionType,
      this.shares,
      this.quote,
      this.fees,
      this.taxes
    );

    // Deep copy the stock splits to avoid shared references, especially for mutable Date objects.
    // We use `push` because the `stockSplits` property is readonly and cannot be reassigned.
    tx.stockSplits.push(
      ...this.stockSplits.map(
        (split) =>
          new StockSplit(new Date(split.splitDate.getTime()), split.splitRatio)
      )
    );

    if (this.stockExchange != null) {
      const { name, country } = this.stockExchange;
      tx.stockExchange = { name, country };
    } else {
      tx.stockExchange = null;
    }

    return tx;
  }

  toJSON() {
    return {
      date: formatNormalizedDate(this.date),
      type: this.transactionType,
      shares: this.shares,
      quote: this.quote,
      fees: this.fees,
      taxes: this.taxes,

      stockSplits: this.stockSplits.map((split) => ({
        splitDate: formatNormalizedDate(split.splitDate),
        splitRatio: split.splitRatio,
        checksum: split.checksum,
      })),

      ...(this.stockExchange && {
        stockExchange: {
          name: this.stockExchange.name,
          country: this.stockExchange.country,
        },
      }),
    };
  }
}

class TransactionRepository {
  static fromJSON(data: unknown): TransactionRepository {
    if (!isTransactionRepositoryJSON(data)) {
      throw new Error("Invalid transaction repository data");
    }

    const repo = new TransactionRepository();

    for (const isin in data) {
      const transactions = data[isin].map((item) => Transaction.fromJSON(item));

      for (const tx of transactions) {
        repo.add(isin, tx);
      }
    }

    return repo;
  }

  readonly data: { [key: string]: Transaction[] };

  constructor() {
    this.data = {};
  }

  add(isin: string, transaction: Transaction): void {
    if (!(isin in this.data)) {
      this.data[isin] = [];
    }

    this.data[isin].push(transaction);
  }

  getTransactions(isin: string): Transaction[] {
    return this.data[isin] ?? [];
  }

  toJSON(): TransactionRepositoryJSON {
    const json: TransactionRepositoryJSON = {};
    for (const isin in this.data) {
      json[isin] = this.data[isin].map((tx) => tx.toJSON());
    }
    return json;
  }
}

export { Transaction, TransactionRepository };
export type { TransactionType };
