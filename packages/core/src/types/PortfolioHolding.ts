import { formatCurrency } from "../utils";
import { BuyTransaction } from "./BuyTransaction";
import { PortfolioOperation } from "./PortfolioOperation";
import { Security } from "./Security";
import { SortedList } from "./utility";

/**
 * A single holding in the portfolio.
 *
 * A holding is tied to a single stock and collects all the historical and current transactions
 * involving that stock.
 */
export class PortfolioHolding {
  static fromOperations(
    security: Security,
    operations: SortedList<PortfolioOperation>
  ): PortfolioHolding {
    const holding = new PortfolioHolding(security);

    for (const op of operations.toArray()) {
      op.apply(holding);
    }

    return holding;
  }

  readonly security: Security;

  readonly currentBuyTransactions: BuyTransaction[];

  shares: number;

  totalFees: number;

  totalTaxes: number;

  totalRealizedGains: number;

  constructor(security: Security) {
    this.security = security;

    this.currentBuyTransactions = [];

    this.shares = 0.0;

    this.totalFees = 0.0;
    this.totalTaxes = 0.0;

    this.totalRealizedGains = 0.0;
  }

  /**
   * The nominal purchase price represents the total amount of money paid to acquire the currently
   * helpd shares without considering additional costs, like fees and taxes.
   */
  get nominalPurchasePrice(): number {
    return this.currentBuyTransactions.reduce(
      (total, tx) => total + tx.shares * tx.pricePerShare,
      0
    );
  }

  /**
   * The total cost basis of a holding represents the total amount of money effectively paid to
   * acquire the currently held shares, including all relevant costs.
   *
   * It allows the calculation of current unrealised gains (market value - total cost basis).
   */
  get totalCostBasis(): number {
    return this.shares === 0 ? 0 : this.nominalPurchasePrice + this.totalFees;
  }

  get averagePricePerShare(): number {
    return this.shares === 0 ? 0 : this.totalCostBasis / this.shares;
  }

  toString(): string {
    return (
      `- ${this.security.name} [ISIN: ${this.security.isin} | NSIN: ${this.security.nsin}]\n` +
      `  Total Number of Shares: ${this.shares.toFixed(3)}\n` +
      `  Total Cost Basis: ${formatCurrency(
        this.totalCostBasis
      )} (incl. fees: ${formatCurrency(this.totalFees)})\n` +
      `  Average Price Per Share: ${formatCurrency(
        this.averagePricePerShare
      )} ` +
      `(nominal: ${formatCurrency(
        this.nominalPurchasePrice / this.shares
      )})\n` +
      `  Total Realized Gains: ${formatCurrency(this.totalRealizedGains)}`
    );
  }
}
