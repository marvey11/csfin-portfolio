import { formatCurrency } from "../utils";
import { ApplicationRepository } from "./ApplicationRepository";
import { PortfolioHolding } from "./PortfolioHolding";
import { PortfolioOperation } from "./PortfolioOperation";
import { Security } from "./Security";

/** Threshold for floating-point comparison */
const TOLERANCE = 1e-6;

class Portfolio {
  static reconstruct(appdata: ApplicationRepository): Portfolio {
    const portfolio = new Portfolio();

    for (const [isin, holdingOperations] of Object.entries(
      appdata.operations.data
    )) {
      const security = appdata.securities.getBy("isin", isin);
      if (!security) {
        console.warn(
          `Security with ISIN ${isin} not found in the repository. Ignoring...`
        );
        continue;
      }

      holdingOperations.toArray().forEach((op) => {
        portfolio.applyOperation(security, op);
      });
    }

    return portfolio;
  }

  private holdings: Map<string, PortfolioHolding>;

  constructor() {
    this.holdings = new Map<string, PortfolioHolding>();
  }

  applyOperation(security: Security, operation: PortfolioOperation): void {
    const isin = security.isin;

    let holding = this.holdings.get(isin);

    if (!holding) {
      holding = new PortfolioHolding(security);
      this.holdings.set(isin, holding);
    }

    operation.apply(holding);
  }

  getHolding(isin: string): PortfolioHolding | undefined {
    return this.holdings.get(isin);
  }

  getAllHoldings(): PortfolioHolding[] {
    return Array.from(this.holdings.values());
  }

  getActiveHoldings(): PortfolioHolding[] {
    return this.getAllHoldings().filter(
      (holding) => holding.shares > TOLERANCE
    );
  }

  get totalCostBasis(): number {
    return this.getAllHoldings().reduce(
      (total, holding) => total + holding.totalCostBasis,
      0
    );
  }

  get totalFees(): number {
    return this.getAllHoldings().reduce(
      (total, holding) => total + holding.totalFees,
      0
    );
  }

  get totalDividends(): number {
    return this.getAllHoldings().reduce(
      (total, holding) => total + holding.totalDividends,
      0
    );
  }

  get totalRealizedGains(): number {
    return this.getAllHoldings().reduce(
      (total, holding) => total + holding.totalRealizedGains,
      0
    );
  }

  toString(): string {
    const activeCount = this.getActiveHoldings().length;
    return (
      `-> Number of Active Holdings: ${activeCount} (${
        this.holdings.size - activeCount
      } inactive})\n` +
      `   Total Cost Basis: ${formatCurrency(
        this.totalCostBasis
      )} (incl. ${formatCurrency(this.totalFees)} fees)\n` +
      `   Total Dividends: ${formatCurrency(this.totalDividends)}\n` +
      `   Total Realized Gains: ${formatCurrency(this.totalRealizedGains)}\n`
    );
  }
}

export { Portfolio };
