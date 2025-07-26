import { calculateGenericChecksum } from "../utils/index.js";
import { PortfolioHolding } from "./PortfolioHolding.js";
import { PortfolioOperation } from "./PortfolioOperation.js";
import { DividendData } from "./schema/index.js";
import { EvalType } from "./utility/evaluation.js";

class Dividend extends PortfolioOperation {
  dividendPerShare: number;
  applicableShares: number;
  exchangeRate: number;
  taxes: number;

  constructor(
    date: Date | string,
    dividendPerShare: number,
    applicableShares: number,
    exchangeRate = 1,
    taxes = 0.0
  ) {
    if (dividendPerShare <= 0) {
      throw new Error("Dividend per share must be greater than zero.");
    }

    super(date);

    this.dividendPerShare = dividendPerShare;
    this.applicableShares = applicableShares;
    this.exchangeRate = exchangeRate;
    this.taxes = taxes;
  }

  get operationType(): string {
    return "DIVIDEND";
  }

  getDividend(evalType: EvalType): number {
    return (
      (this.dividendPerShare * this.applicableShares) / this.exchangeRate -
      (evalType === "gross" ? 0 : this.taxes)
    );
  }

  override apply(holding: PortfolioHolding): void {
    holding.totalDividends +=
      (this.applicableShares * this.dividendPerShare) / this.exchangeRate;
    holding.dividendTaxes += this.taxes;
  }

  override clone(): Dividend {
    return new Dividend(
      new Date(this.date.getTime()),
      this.dividendPerShare,
      this.applicableShares,
      this.exchangeRate,
      this.taxes
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
      taxes: this.taxes,
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
