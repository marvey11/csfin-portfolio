import {
  calculateGenericChecksum,
  formatCurrency,
  formatNormalizedDate,
} from "../utils";
import { PortfolioHolding } from "./PortfolioHolding";
import { PortfolioOperation } from "./PortfolioOperation";
import { DividendData } from "./schema";

class Dividend extends PortfolioOperation {
  dividendPerShare: number;

  constructor(date: Date | string, dividendPerShare: number) {
    if (dividendPerShare <= 0) {
      throw new Error("Dividend per share must be greater than zero.");
    }

    super(date);

    this.dividendPerShare = dividendPerShare;
  }

  get operationType(): string {
    return "DIVIDEND";
  }

  override apply(holding: PortfolioHolding): void {
    console.log(
      `Total dividend of ${formatCurrency(
        holding.shares * this.dividendPerShare
      )} paid to ${holding.security.isin} on ${formatNormalizedDate(this.date)}`
    );
  }

  override clone(): Dividend {
    return new Dividend(new Date(this.date.getTime()), this.dividendPerShare);
  }

  override toString(): string {
    return `${this.operationType} (${this.dividendPerShare})`;
  }

  override toJSON(): DividendData {
    return {
      ...super.toJSON(),
      operationType: "DIVIDEND",
      dividendPerShare: this.dividendPerShare,
    };
  }

  protected override calculateChecksum(): string {
    return calculateGenericChecksum(this.date);
  }
}

export { Dividend };
