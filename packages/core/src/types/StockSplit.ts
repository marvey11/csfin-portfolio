import { calculateGenericChecksum } from "../utils";
import { PortfolioHolding } from "./PortfolioHolding";
import { PortfolioOperation } from "./PortfolioOperation";
import { StockSplitData } from "./schema";

class StockSplit extends PortfolioOperation {
  readonly splitRatio: number;

  constructor(date: Date | string, ratio: number) {
    if (ratio <= 0) {
      throw new Error("Ratio must be greater than zero.");
    }

    super(date);

    this.splitRatio = ratio;
  }

  override get operationType(): string {
    return "SPLIT";
  }

  override apply(holding: PortfolioHolding): void {
    for (const tx of holding.currentBuyTransactions) {
      tx.shares *= this.splitRatio;
      tx.pricePerShare /= this.splitRatio;
    }

    holding.shares *= this.splitRatio;
  }

  override clone(): StockSplit {
    return new StockSplit(new Date(this.date.getTime()), this.splitRatio);
  }

  override toString(): string {
    return `${this.operationType} (${this.splitRatio})`;
  }

  override toJSON(): StockSplitData {
    return {
      ...super.toJSON(),
      operationType: "SPLIT",
      splitRatio: this.splitRatio,
    };
  }

  protected override calculateChecksum(): string {
    return calculateGenericChecksum(this.date, this.splitRatio);
  }
}

export { StockSplit };
