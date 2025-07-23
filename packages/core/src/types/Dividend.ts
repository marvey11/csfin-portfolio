import { calculateGenericChecksum } from "../utils";
import { PortfolioHolding } from "./PortfolioHolding";
import { PortfolioOperation } from "./PortfolioOperation";
import { DividendData } from "./schema";

class Dividend extends PortfolioOperation {
  dividendPerShare: number;
  applicableShares: number;
  exchangeRate: number;

  constructor(
    date: Date | string,
    dividendPerShare: number,
    applicableShares: number,
    exchangeRate = 1
  ) {
    if (dividendPerShare <= 0) {
      throw new Error("Dividend per share must be greater than zero.");
    }

    super(date);

    this.dividendPerShare = dividendPerShare;
    this.applicableShares = applicableShares;
    this.exchangeRate = exchangeRate;
  }

  get operationType(): string {
    return "DIVIDEND";
  }

  override apply(holding: PortfolioHolding): void {
    holding.totalDividends +=
      (this.applicableShares * this.dividendPerShare) /
      (this.exchangeRate ?? 1);
  }

  override clone(): Dividend {
    return new Dividend(
      new Date(this.date.getTime()),
      this.dividendPerShare,
      this.applicableShares,
      this.exchangeRate
    );
  }

  override toString(): string {
    return `${this.operationType} (${this.dividendPerShare})`;
  }

  override toJSON(): DividendData {
    return {
      ...super.toJSON(),
      operationType: "DIVIDEND",
      dividendPerShare: this.dividendPerShare,
      applicableShares: this.applicableShares,
      exchangeRate: this.exchangeRate,
    };
  }

  protected override calculateChecksum(): string {
    return calculateGenericChecksum(
      this.date,
      this.applicableShares,
      this.dividendPerShare
    );
  }
}

export { Dividend };
