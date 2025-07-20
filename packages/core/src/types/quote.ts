import {
  compareNormalizedDates,
  formatNormalizedDate,
  getDateObject,
} from "../utils";
import {
  isQuoteItemJSON,
  isQuoteRepositoryJSON,
  QuoteItemJSON,
  QuoteRepositoryJSON,
} from "./json";

class QuoteItem {
  static fromJSON(data: unknown): QuoteItem {
    if (!isQuoteItemJSON(data)) {
      throw new Error("Invalid quote item data");
    }

    return new QuoteItem(data.date, data.price);
  }

  readonly date: Date;
  price: number;

  constructor(date: string | Date, price: number) {
    this.date = getDateObject(date);
    this.price = price;
  }

  toJSON(): QuoteItemJSON {
    return {
      date: formatNormalizedDate(this.date),
      price: this.price,
    };
  }
}

class QuoteRepository {
  static fromJSON(data: unknown): QuoteRepository {
    if (!isQuoteRepositoryJSON(data)) {
      throw new Error("Invalid quote repository data");
    }

    const repo = new QuoteRepository();

    for (const isin in data) {
      const quotes = data[isin].map((item) => QuoteItem.fromJSON(item));

      for (const q of quotes) {
        repo.add(isin, q);
      }
    }

    return repo;
  }

  /**
   * Stores a list of quote items per ISIN.
   *
   * Each list of quote items is sorted by date to speed up lookup operations.
   */
  readonly quotes: { [key: string]: QuoteItem[] };

  constructor() {
    this.quotes = {};
  }

  add(isin: string, quote: QuoteItem): void;
  add(isin: string, date: string | Date, price: number): void;
  add(isin: string, param: QuoteItem | Date | string, price?: number): void {
    if (typeof isin === "string") {
      if (typeof param === "object" && param instanceof QuoteItem) {
        this.addQuoteItem(isin, param);
        return;
      } else if (
        ((typeof param === "object" && param instanceof Date) ||
          typeof param === "string") &&
        typeof price === "number"
      ) {
        this.addQuoteItem(isin, new QuoteItem(param, price));
        return;
      }
    }

    throw new Error(
      "Invalid arguments for add. Expected QuoteItem object or the quote item's date and price parameters."
    );
  }

  getLatestQuote(isin: string): QuoteItem | undefined {
    if (!(isin in this.quotes)) {
      return undefined;
    }

    const quoteList = this.quotes[isin];
    const quoteLen = quoteList.length;
    return quoteLen ? quoteList[quoteLen - 1] : undefined;
  }

  toJSON(): QuoteRepositoryJSON {
    const json: QuoteRepositoryJSON = {};
    for (const isin in this.quotes) {
      json[isin] = this.quotes[isin].map((item) => item.toJSON());
    }
    return json;
  }

  toString(): string {
    return `> Quotes: ${
      Object.keys(this.quotes).length
    } ISINs stored, ${Object.values(this.quotes).reduce(
      (count, quoteArray) => count + quoteArray.length,
      0
    )} quotes stored\n`;
  }

  private addQuoteItem(isin: string, quote: QuoteItem) {
    if (!(isin in this.quotes)) {
      // Quotes for this ISIN are not yet stored

      // Create new list and add the new quote directly
      this.quotes[isin] = [quote];

      return;
    }

    // Binary Search algorithm

    let low = 0;
    let high = this.quotes[isin].length - 1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const midItem = this.quotes[isin][mid];

      const cmp = compareNormalizedDates(quote.date, midItem.date);

      if (cmp === 0) {
        // Replace existing quote if dates match.
        this.quotes[isin][mid] = quote;
        return;
      }

      if (cmp < 0) {
        // new quotes's date is earlier than midItem's date
        high = mid - 1;
      } else {
        // new quotes's date is later than midItem's date
        low = mid + 1;
      }
    }

    this.quotes[isin].splice(low, 0, quote);
  }
}

export { QuoteItem, QuoteRepository };
