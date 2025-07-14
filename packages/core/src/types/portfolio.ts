import { currencyFormatter } from "../utils";
import { Security } from "./security";
import { Transaction } from "./Transaction";

/** Threshold for floating-point comparison */
const TOLERANCE = 1e-6;

/**
 * A single position (or holding) in the portfolio.
 *
 * A position is tied to a single stock and collects all the historical and current transactions
 * involving that stock.
 */
class PortfolioPosition {
  /** Stores the overall list of transactions. */
  transactions: Transaction[];

  /** Stores the currently active transactions (those that have not been fully sold). */
  currentTransactions: Transaction[];

  /** The security associated with this portfolio position. */
  security: Security;

  /** The realized gain (profit/loss) for this position without considering fees or taxes. */
  private realizedGainGross: number;

  /**
   * The accumulated fees and taxes for this position for the transactions that have been closed.
   */
  private accumulatedFeesAndTaxes: number;

  constructor(security: Security) {
    this.transactions = [];
    this.currentTransactions = [];

    this.security = security;

    this.realizedGainGross = 0;
    this.accumulatedFeesAndTaxes = 0;
  }

  getTransactions(): Transaction[] {
    return this.transactions;
  }

  /** Adds a transaction involving the current stock. */
  addTransaction(transaction: Transaction): void {
    // Unconditionally store all transactions for historical views and also XIRR calculations
    this.transactions.push(transaction);

    if (transaction.type === "BUY") {
      // Add a copy of the transaction to the current ones if it's a BUY transaction
      this.currentTransactions.push({ ...transaction });
    } else if (transaction.type === "SELL") {
      let sharesToSell = transaction.shares;

      if (sharesToSell - this.getCurrentShares() > TOLERANCE) {
        throw new Error(
          "Cannot sell more shares than are currently in this portfolio position!"
        );
      }

      while (sharesToSell > TOLERANCE && this.currentTransactions.length > 0) {
        const tx = this.currentTransactions[0];

        if (tx.shares >= sharesToSell) {
          // If the current transaction has enough shares to cover the sell
          tx.shares -= sharesToSell;

          // Update realized gain
          this.realizedGainGross +=
            (transaction.quote - tx.quote) * sharesToSell;

          // Mark current sell as complete
          sharesToSell = 0;
        } else {
          // If the current transaction does not have enough shares, sell all it has
          sharesToSell -= tx.shares;

          // Update realized gain
          this.realizedGainGross += (transaction.quote - tx.quote) * tx.shares;

          // Mark the transaction as fully sold
          tx.shares = 0;
        }

        if (tx.shares < TOLERANCE) {
          // The current transaction is fully sold, and we can add its fees and taxes
          this.accumulatedFeesAndTaxes += tx.fees + tx.taxes;
          // Remove the transaction if shares are exhausted
          this.currentTransactions.shift();
        }
      }

      // The SELL transaction is now fully processed, and we can add its fees and taxes
      this.accumulatedFeesAndTaxes += transaction.fees + transaction.taxes;
    }
  }

  /**
   * The number of currently owned shares.
   *
   * Current shares are defined as the shares obtained since the position was last fully sold out
   * (if applicable).
   */
  getCurrentShares(): number {
    return this.currentTransactions.reduce(
      (total, transaction) => total + transaction.shares,
      0
    );
  }

  /** The price paid for the currently owned shares. */
  getCurrentBuyValue(): number {
    return this.currentTransactions.reduce(
      (total, transaction) => total + transaction.shares * transaction.quote,
      0
    );
  }

  /** The average price of the currently owned shares. */
  getCurrentAveragePrice(): number {
    const shares = this.getCurrentShares();
    return shares > TOLERANCE ? this.getCurrentBuyValue() / shares : 0;
  }

  /**
   * The profit (or loss) realised from shares in this position that have been previously sold off.
   *
   * @param type The type of evaluation, can be `gross` (fees or taxes are not considered in evaluation) or `net` (taking fees and taxes into account).
   * @returns The absolute gains (profit or loss) that have been realised.
   */
  getRealizedGains(type: "net" | "gross"): number {
    return (
      this.realizedGainGross -
      (type === "net" ? this.accumulatedFeesAndTaxes : 0)
    );
  }

  // Generic methods

  toString(): string {
    return (
      `- ${this.security.name} (${this.security.isin} | ${this.security.nsin})\n` +
      `  Number of Total Transactions: ${this.transactions.length}\n` +
      `  Number of Currently Active (BUY) Transactions: ${this.currentTransactions.length}\n` +
      `  Current Shares: ${this.getCurrentShares().toFixed(3)}\n` +
      `  Buy Value of Current Shares (Gross): ${currencyFormatter.format(
        this.getCurrentBuyValue()
      )}\n` +
      `  Current Average Price (Gross): ${currencyFormatter.format(
        this.getCurrentAveragePrice()
      )}\n` +
      `  Realised Gain (Gross): ${currencyFormatter.format(
        this.getRealizedGains("gross")
      )}\n` +
      `  Realised Gain (Net): ${currencyFormatter.format(
        this.getRealizedGains("net")
      )}`
    );
  }
}

class Portfolio {
  private positions: { [key: string]: PortfolioPosition };

  constructor() {
    this.positions = {};
  }

  getAllPositions(): PortfolioPosition[] {
    return Object.values(this.positions);
  }

  getPosition(isin: string): PortfolioPosition | null;
  getPosition(security: Security): PortfolioPosition | null;
  getPosition(param: string | Security): PortfolioPosition | null {
    return this.positions[typeof param === "string" ? param : param.isin];
  }

  addTransaction(security: Security, transaction: Transaction): void {
    this.getOrCreatePosition(security).addTransaction(transaction);
  }

  getRealizedGains(type: "net" | "gross") {
    return Object.values(this.positions).reduce(
      (total, position) => total + position.getRealizedGains(type),
      0.0
    );
  }

  // Generic methods

  toString(): string {
    return this.getAllPositions()
      .map((position) => position.toString())
      .join("\n\n");
  }

  // Private helper methods

  private getOrCreatePosition(security: Security): PortfolioPosition {
    const isin = security.isin;

    if (!this.positions[isin]) {
      this.positions[isin] = new PortfolioPosition(security);
    }

    return this.positions[isin];
  }
}

export { Portfolio, PortfolioPosition };
