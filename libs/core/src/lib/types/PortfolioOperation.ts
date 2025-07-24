import { formatNormalizedDate, getDateObject } from "../utils/index.js";
import { PortfolioHolding } from "./PortfolioHolding.js";
import { BaseOperationData } from "./schema/index.js";

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
