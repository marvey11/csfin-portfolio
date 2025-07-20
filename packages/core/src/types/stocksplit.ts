import {
  calculateGenericChecksum,
  formatNormalizedDate,
  getDateObject,
} from "../utils";
import {
  isStockSplitJSON,
  isStockSplitRepositoryJSON,
  StockSplitJSON,
  StockSplitRepositoryJSON,
} from "./json";

/**
 * Represents a stock split event with its date, ratio, and a checksum for identification.
 */
class StockSplit {
  static fromJSON(data: unknown): StockSplit {
    if (!isStockSplitJSON(data)) {
      throw new Error(`Invalid stock split data: ${JSON.stringify(data)}`);
    }

    const splitDate = getDateObject(data.splitDate);

    if (data.checksum) {
      // sanity check for the restored data
      const checksum = calculateGenericChecksum(splitDate, data.splitRatio);
      if (data.checksum !== checksum) {
        throw new Error("Invalid stock split checksum");
      }
    }

    return new StockSplit(splitDate, data.splitRatio);
  }

  /** The date on which the stock split occurred. */
  readonly splitDate: Date;
  /** The ratio of the stock split (e.g., 2 for a 2-for-1 split). */
  splitRatio: number;
  /** A checksum to uniquely identify the split event. */
  readonly checksum: string;

  constructor(splitDate: Date, splitRatio: number) {
    this.splitDate = splitDate;
    this.splitRatio = splitRatio;
    this.checksum = calculateGenericChecksum(splitDate, splitRatio);
  }

  toJSON(): StockSplitJSON {
    return {
      splitDate: formatNormalizedDate(this.splitDate),
      splitRatio: this.splitRatio,
      checksum: this.checksum,
    };
  }
}

class StockSplitRepository {
  static fromJSON(data: unknown): StockSplitRepository {
    if (!isStockSplitRepositoryJSON(data)) {
      throw new Error("Invalid stock split repository data");
    }

    const repo = new StockSplitRepository();

    for (const isin in data) {
      const splits = data[isin].map((item) => StockSplit.fromJSON(item));

      for (const split of splits) {
        repo.add(isin, split);
      }
    }

    return repo;
  }

  readonly splitsData: { [key: string]: StockSplit[] };

  constructor() {
    this.splitsData = {};
  }

  add(isin: string, split: StockSplit): void {
    if (!(isin in this.splitsData)) {
      this.splitsData[isin] = [];
    }

    this.splitsData[isin].push(split);
  }

  getSplits(isin: string): StockSplit[] {
    return this.splitsData[isin] ?? [];
  }

  toJSON(): StockSplitRepositoryJSON {
    const json: StockSplitRepositoryJSON = {};
    for (const isin in this.splitsData) {
      json[isin] = this.splitsData[isin].map((split) => split.toJSON());
    }
    return json;
  }
}

export { StockSplit, StockSplitRepository };
