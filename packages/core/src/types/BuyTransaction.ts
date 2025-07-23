import { calculateGenericChecksum } from "../utils";
import { BaseTransaction } from "./BaseTransaction";
import { PortfolioHolding } from "./PortfolioHolding";
import { BuyTransactionData } from "./schema";

class BuyTransaction extends BaseTransaction {
  constructor(
    date: Date | string,
    shares: number,
    pricePerShare: number,
    fees = 0.0
  ) {
    super(date, shares, pricePerShare, fees);
  }

  override get operationType(): string {
    return "BUY";
  }

  override apply(holding: PortfolioHolding): void {
    holding.currentBuyTransactions.push(this.clone());
    holding.shares += this.shares;
    holding.totalFees += this.fees;
  }

  override clone(): BuyTransaction {
    return new BuyTransaction(
      new Date(this.date.getTime()),
      this.shares,
      this.pricePerShare,
      this.fees
    );
  }

  override toString(): string {
    return `${this.operationType} ${this.shares} shares @ ${this.pricePerShare}`;
  }

  override toJSON(): BuyTransactionData {
    return { ...super.toJSON(), operationType: "BUY" };
  }

  protected override calculateChecksum(): string {
    return calculateGenericChecksum(
      this.date,
      this.shares,
      this.pricePerShare,
      this.fees
    );
  }
}

export { BuyTransaction };
