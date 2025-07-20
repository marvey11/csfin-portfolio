import { isPortfolioJSON, PortfolioJSON } from "./portfolio";
import { isQuoteRepositoryJSON, QuoteRepositoryJSON } from "./quote";
import { isSecurityRepositoryJSON, SecurityRepositoryJSON } from "./security";
import {
  isStockSplitRepositoryJSON,
  StockSplitRepositoryJSON,
} from "./stocksplit";

interface ApplicationDataJSON {
  securities: SecurityRepositoryJSON;
  quotes: QuoteRepositoryJSON;
  stockSplits: StockSplitRepositoryJSON;
  portfolio: PortfolioJSON;
}

const isApplicationDataJSON = (data: unknown): data is ApplicationDataJSON => {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const potential = data as { [key: string]: unknown };

  return (
    "securities" in potential &&
    isSecurityRepositoryJSON(potential.securities) &&
    "quotes" in potential &&
    isQuoteRepositoryJSON(potential.quotes) &&
    "stockSplits" in potential &&
    isStockSplitRepositoryJSON(potential.stockSplits) &&
    "portfolio" in potential &&
    isPortfolioJSON(potential.portfolio)
  );
};

export { isApplicationDataJSON };
export type { ApplicationDataJSON };
