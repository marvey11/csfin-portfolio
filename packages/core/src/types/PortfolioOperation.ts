import { formatNormalizedDate, getDateObject } from "../utils";
import { PortfolioHolding } from "./PortfolioHolding";
import { BaseOperationData } from "./schema";

abstract class PortfolioOperation {
  readonly date: Date;

  constructor(date: Date | string) {
    this.date = getDateObject(date);
  }

  abstract get operationType(): string;

  abstract apply(holding: PortfolioHolding): void;

  get checksum(): string {
    return this.calculateChecksum();
  }

  abstract clone(): PortfolioOperation;

  abstract toString(): string;

  toJSON(): BaseOperationData {
    return {
      operationType: this.operationType,
      date: formatNormalizedDate(this.date),
      checksum: this.checksum,
    };
  }

  protected abstract calculateChecksum(): string;
}

export { PortfolioOperation };
