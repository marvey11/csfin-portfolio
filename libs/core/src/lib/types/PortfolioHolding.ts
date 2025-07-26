import { BuyTransaction } from "./BuyTransaction.js";
import { PortfolioOperation } from "./PortfolioOperation.js";
import { Security } from "./Security.js";
import { SortedList } from "./utility/index.js";

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

  salesTaxes: number;

  dividendTaxes: number;

  totalDividends: number;

  totalRealizedGains: number;

  constructor(security: Security) {
    this.security = security;

    this.currentBuyTransactions = [];

    this.shares = 0.0;

    this.totalFees = 0.0;

    this.salesTaxes = 0.0;
    this.dividendTaxes = 0.0;

    this.totalDividends = 0.0;

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
}
