import { ApplicationDataJSON, isApplicationDataJSON } from "./json";
import { Portfolio } from "./portfolio";
import { QuoteRepository } from "./quote";
import { SecurityRepository } from "./security";
import { StockSplitRepository } from "./stocksplit";

class ApplicationData {
  static fromJSON(data: unknown): ApplicationData {
    if (!isApplicationDataJSON(data)) {
      throw new Error("Invalid application data");
    }

    const securities = SecurityRepository.fromJSON(data.securities);
    const splits = StockSplitRepository.fromJSON(data.stockSplits);

    return new ApplicationData(
      securities,
      QuoteRepository.fromJSON(data.quotes),
      splits,
      Portfolio.fromJSON(data.portfolio, securities, splits)
    );
  }

  securities: SecurityRepository;
  quotes: QuoteRepository;
  stockSplits: StockSplitRepository;
  portfolio: Portfolio;

  constructor(
    securities: SecurityRepository,
    quotes: QuoteRepository,
    stockSplits: StockSplitRepository,
    portfolio: Portfolio
  ) {
    this.securities = securities;
    this.quotes = quotes;
    this.stockSplits = stockSplits;
    this.portfolio = portfolio;
  }

  toJSON(): ApplicationDataJSON {
    return {
      securities: this.securities.toJSON(),
      quotes: this.quotes.toJSON(),
      stockSplits: this.stockSplits.toJSON(),
      portfolio: this.portfolio.toJSON(),
    };
  }
}

export { ApplicationData };
