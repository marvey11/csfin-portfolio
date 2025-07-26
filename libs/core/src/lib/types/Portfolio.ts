import { isEffectivelyZero } from "../utils/index.js";
import { ApplicationRepository } from "./ApplicationRepository.js";
import { PortfolioHolding } from "./PortfolioHolding.js";
import { PortfolioOperation } from "./PortfolioOperation.js";
import { QuoteItem } from "./QuoteItem.js";
import { Security } from "./Security.js";

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
    return this.getSumOverHoldings("totalCostBasis");
  }

  get totalFees(): number {
    return this.getSumOverHoldings("totalFees");
  }

  get totalDividends(): number {
    return this.getSumOverHoldings("totalDividends");
  }

  get totalRealizedGains(): number {
    return this.getSumOverHoldings("totalRealizedGains");
  }

  get totalDividendTaxes(): number {
    return this.getSumOverHoldings("dividendTaxes");
  }

  getCurrentValue(latestQuotes: {
    [key: string]: QuoteItem | undefined;
  }): number {
    return this.getAllHoldings().reduce((total, holding) => {
      const isin = holding.security.isin;
      const latestQuote = latestQuotes[isin];

      if (isEffectivelyZero(holding.shares)) {
        return total;
      }

      if (!latestQuote) {
        console.warn(`Quote not found for ISIN: ${isin}`);
        return total;
      }

      return total + holding.shares * latestQuote.price;
    }, 0);
  }

  private getSumOverHoldings<
    K extends
      | "totalCostBasis"
      | "totalRealizedGains"
      | "totalDividends"
      | "totalFees"
      | "dividendTaxes"
  >(key: K): number {
    return this.getAllHoldings().reduce(
      (total, holding) => total + holding[key],
      0
    );
  }
}

export { Portfolio };
