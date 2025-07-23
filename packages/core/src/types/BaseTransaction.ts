import { PortfolioOperation } from "./PortfolioOperation";
import { BaseTransactionData } from "./schema";

abstract class BaseTransaction extends PortfolioOperation {
  shares: number;

  pricePerShare: number;

  fees: number;

  taxes: number;

  constructor(
    date: Date | string,
    shares: number,
    pricePerShare: number,
    fees: number,
    taxes = 0.0
  ) {
    if (shares < 0) {
      throw new Error("Number of shares cannot be negative.");
    }
    if (pricePerShare < 0) {
      throw new Error("Price per share cannot be negative.");
    }
    if (fees < 0) {
      throw new Error("Fees cannot be negative.");
    }
    if (taxes < 0) {
      throw new Error("Taxes cannot be negative.");
    }

    super(date);

    this.shares = shares;
    this.pricePerShare = pricePerShare;
    this.fees = fees;
    this.taxes = taxes;
  }

  override toJSON(): BaseTransactionData {
    return {
      ...super.toJSON(),
      shares: this.shares,
      pricePerShare: this.pricePerShare,
      fees: this.fees,
    };
  }
}

export { BaseTransaction };
