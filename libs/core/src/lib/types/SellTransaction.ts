import { FLOATING_POINT_TOLERANCE } from "@csfin-portfolio/shared";
import { calculateGenericChecksum, isEffectivelyZero } from "../utils/index.js";
import { BaseTransaction } from "./BaseTransaction.js";
import { BuyTransaction } from "./BuyTransaction.js";
import { PortfolioHolding } from "./PortfolioHolding.js";
import { SellTransactionData } from "./schema/index.js";

class SellTransaction extends BaseTransaction {
  constructor(
    date: Date | string,
    shares: number,
    pricePerShare: number,
    fees = 0.0,
    taxes = 0.0
  ) {
    super(date, shares, pricePerShare, fees, taxes);
  }

  override get operationType(): string {
    return "SELL";
  }

  override apply(holding: PortfolioHolding): void {
    let sharesToSell = this.shares;

    if (sharesToSell - holding.shares > FLOATING_POINT_TOLERANCE) {
      throw new Error(
        `Cannot sell more shares than are currently in this portfolio holding (ISIN: ${holding.security.isin})`
      );
    }

    while (
      sharesToSell > FLOATING_POINT_TOLERANCE &&
      holding.currentBuyTransactions.length > 0
    ) {
      const tx = holding.currentBuyTransactions[0] as BuyTransaction;

      if (tx.shares >= sharesToSell) {
        // If the current transaction has enough shares to cover the sell
        tx.shares -= sharesToSell;

        // Update realized gain
        holding.totalRealizedGains +=
          (this.pricePerShare - tx.pricePerShare) * sharesToSell;

        // Mark current sell as complete
        sharesToSell = 0;
      } else {
        // If the current transaction does not have enough shares, sell all it has
        sharesToSell -= tx.shares;

        // Update realized gain
        holding.totalRealizedGains +=
          (this.pricePerShare - tx.pricePerShare) * tx.shares;

        // Mark the transaction as fully sold
        tx.shares = 0;
      }

      if (isEffectivelyZero(tx.shares)) {
        // Remove the transaction if shares are exhausted
        holding.currentBuyTransactions.shift();
      }
    }

    // The SELL transaction is now fully processed, and we update some values
    holding.shares -= this.shares;

    if (isEffectivelyZero(holding.shares)) {
      holding.shares = 0.0;
      // reset fees and taxes if the position is fully sold
      holding.totalFees = 0.0;
      holding.totalTaxes = 0.0;
    } else {
      holding.totalFees += this.fees;
      holding.totalTaxes += this.taxes;
    }
  }

  override clone(): SellTransaction {
    return new SellTransaction(
      new Date(this.date.getTime()),
      this.shares,
      this.pricePerShare,
      this.fees,
      this.taxes
    );
  }

  override toString(): string {
    return `${this.operationType} ${this.shares} shares @ ${this.pricePerShare}`;
  }

  override toJSON(): SellTransactionData {
    return {
      ...super.toJSON(),
      operationType: "SELL",
      taxes: this.taxes,
    };
  }

  protected override calculateChecksum(): string {
    return calculateGenericChecksum(
      this.date,
      this.shares,
      this.pricePerShare,
      this.fees,
      this.taxes
    );
  }
}

export { SellTransaction };
