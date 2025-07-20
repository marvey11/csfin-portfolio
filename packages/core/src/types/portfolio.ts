import { formatCurrency } from "../utils";
import { isPortfolioJSON, PortfolioJSON } from "./json";
import { Security, SecurityRepository } from "./security";
import { StockSplit, StockSplitRepository } from "./stocksplit";
import { Transaction } from "./transaction";

/** Threshold for floating-point comparison */
const TOLERANCE = 1e-6;

/**
 * A single holding in the portfolio.
 *
 * A holding is tied to a single stock and collects all the historical and current transactions
 * involving that stock.
 */
class PortfolioHolding {
  static fromJSON(data: unknown, security: Security): PortfolioHolding {
    const holding = new PortfolioHolding(security);

    if (Array.isArray(data)) {
      const transactions = data.map((tx) => Transaction.fromJSON(tx));

      for (const tx of transactions) {
        holding.addTransaction(tx);
      }

      return holding;
    }

    throw new Error("Invalid transaction list data");
  }

  /** Stores the overall list of transactions. */
  readonly transactions: Transaction[];

  /** Stores the currently active transactions (those that have not been fully sold). */
  readonly currentTransactions: Transaction[];

  /** The security associated with this portfolio holding. */
  security: Security;

  /** The list of stock splits associated to this holding. */
  readonly stockSplits: StockSplit[];

  /** The realized gain (profit/loss) for this holding without considering fees or taxes. */
  private realizedGainGross: number;

  /**
   * The accumulated fees and taxes for this holding for the transactions that have been closed.
   */
  private accumulatedFeesAndTaxes: number;

  constructor(security: Security, stockSplits: StockSplit[] = []) {
    this.transactions = [];
    this.currentTransactions = [];

    this.security = security;

    this.stockSplits = stockSplits;

    this.realizedGainGross = 0;
    this.accumulatedFeesAndTaxes = 0;
  }

  getTransactions(): Transaction[] {
    return this.transactions;
  }

  addTransactions(transactions: Transaction[]): void {
    const cloned = transactions.map((tx) => tx.clone());
    cloned.sort((a, b) => a.date.getTime() - b.date.getTime());

    for (const tx of cloned) {
      this.addTransaction(tx);
    }
  }

  /** Adds a transaction involving the current stock. */
  addTransaction(transaction: Transaction): void {
    transaction.applyStockSplits(this.stockSplits);

    // Unconditionally store all transactions for historical views and also XIRR calculations
    this.transactions.push(transaction);

    if (transaction.transactionType === "BUY") {
      // Add a copy of the transaction to the current ones if it's a BUY transaction
      this.currentTransactions.push(transaction.clone());
    } else if (transaction.transactionType === "SELL") {
      let sharesToSell = transaction.shares;

      if (sharesToSell - this.getCurrentShares() > TOLERANCE) {
        console.error(
          `ISIN: ${
            this.security.isin
          }, SHARES TO SELL: ${sharesToSell}, CURRENT SHARES: ${this.getCurrentShares()}`
        );
        throw new Error(
          `Cannot sell more shares than are currently in this portfolio holding (ISIN: ${this.security.isin})`
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

  addStockSplits(stockSplits: StockSplit[]): void {
    for (const split of stockSplits) {
      this.addStockSplit(split);
    }
  }

  addStockSplit(stockSplit: StockSplit): void {
    if (
      this.stockSplits.some((split) => split.checksum === stockSplit.checksum)
    ) {
      console.warn("Stock split already applied");
      return;
    }
    this.stockSplits.push(stockSplit);
  }

  /**
   * The number of currently owned shares.
   *
   * Current shares are defined as the shares obtained since the holding was last fully sold out
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
   * The profit (or loss) realised from shares in this holding that have been previously sold off.
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

  toJSON() {
    return this.transactions.map((tx) => tx.toJSON());
  }

  toString(): string {
    return (
      `- ${this.security.name} (${this.security.isin} | ${this.security.nsin})\n` +
      `  Number of Total Transactions: ${this.transactions.length}\n` +
      `  Number of Currently Active (BUY) Transactions: ${this.currentTransactions.length}\n` +
      `  Current Shares: ${this.getCurrentShares().toFixed(3)}\n` +
      `  Buy Value of Current Shares: ${formatCurrency(
        this.getCurrentBuyValue()
      )} (gross)\n` +
      `  Current Average Price: ${formatCurrency(
        this.getCurrentAveragePrice()
      )} (gross)\n` +
      `  Realised Gain: ${formatCurrency(
        this.getRealizedGains("gross")
      )} (gross), ${formatCurrency(this.getRealizedGains("net"))} (net)`
    );
  }
}

class Portfolio {
  static fromJSON(
    data: unknown,
    securityRepository: SecurityRepository,
    stockSplits: StockSplitRepository
  ): Portfolio {
    if (!isPortfolioJSON(data)) {
      throw new Error("Invalid portfolio data");
    }

    const portfolio = new Portfolio(stockSplits);

    for (const holdingData of data.holdings) {
      const { isin, transactions, stockSplits } = holdingData;

      const security = securityRepository.getBy("isin", isin);
      if (!security) {
        throw new Error(`Security with ISIN ${isin} not found`);
      }

      const holding = PortfolioHolding.fromJSON(transactions, security);

      holding.stockSplits.push(...stockSplits.map(StockSplit.fromJSON));

      portfolio.holdings[isin] = holding;
    }

    return portfolio;
  }

  private holdings: { [key: string]: PortfolioHolding };
  private stockSplits: StockSplitRepository;

  constructor(stockSplits: StockSplitRepository) {
    this.holdings = {};
    this.stockSplits = stockSplits;
  }

  /** Adds a list of transactions to this portfolio. */
  addTransactions(security: Security, transactions: Transaction[]): void {
    this.getOrCreateHolding(security).addTransactions(transactions);
  }

  /** Adds a single transaction to this portfolio. */
  addTransaction(security: Security, transaction: Transaction): void {
    this.getOrCreateHolding(security).addTransaction(transaction);
  }

  addStockSplits(security: Security, stockSplits: StockSplit[]): void {
    this.getOrCreateHolding(security).stockSplits.push(...stockSplits);
  }

  addStockSplit(security: Security, stockSplit: StockSplit): void {
    this.getOrCreateHolding(security).stockSplits.push(stockSplit);
  }

  getAllHoldings(): PortfolioHolding[] {
    return Object.values(this.holdings);
  }

  getHolding(isin: string): PortfolioHolding | null;
  getHolding(security: Security): PortfolioHolding | null;
  getHolding(param: string | Security): PortfolioHolding | null {
    return this.holdings[typeof param === "string" ? param : param.isin];
  }

  getRealizedGains(type: "net" | "gross") {
    return Object.values(this.holdings).reduce(
      (total, holding) => total + holding.getRealizedGains(type),
      0.0
    );
  }

  toJSON(): PortfolioJSON {
    const jsonHoldings = Object.entries(this.holdings).map(
      ([isin, holding]) => ({
        isin,
        transactions: holding.getTransactions().map((tx) => tx.toJSON()),
        stockSplits: [],
      })
    );

    return {
      holdings: jsonHoldings,
    };
  }

  toString(): string {
    return this.getAllHoldings()
      .map((holding) => holding.toString())
      .join("\n\n");
  }

  private getOrCreateHolding(security: Security): PortfolioHolding {
    const isin = security.isin;

    if (!this.holdings[isin]) {
      this.holdings[isin] = new PortfolioHolding(
        security,
        this.stockSplits.getSplits(isin)
      );
    }

    return this.holdings[isin];
  }
}

export { Portfolio, PortfolioHolding };
