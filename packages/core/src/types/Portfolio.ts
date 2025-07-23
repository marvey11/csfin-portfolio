import { ApplicationRepository } from "./ApplicationRepository";
import { PortfolioHolding } from "./PortfolioHolding";
import { PortfolioOperation } from "./PortfolioOperation";
import { Security } from "./Security";

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
}

export { Portfolio };
