import { compareNormalizedDates } from "../utils/index.js";
import { QuoteItem } from "./QuoteItem.js";
import { QuoteRepositoryData, QuoteRepositorySchema } from "./schema/index.js";

class QuoteRepository {
  static fromJSON(data: unknown): QuoteRepository {
    const validatedData = QuoteRepositorySchema.parse(data);

    const repo = new QuoteRepository();

    for (const [isin, quoteItems] of Object.entries(validatedData)) {
      const quotes = quoteItems.map((item) => QuoteItem.fromJSON(item));
      repo.addAll(isin, quotes);
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

  addAll(isin: string, quotes: QuoteItem[]): void {
    quotes.forEach((quote) => this.addQuoteItem(isin, quote));
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

    const quoteList = this.quotes[isin] as QuoteItem[];
    const quoteLen = quoteList.length;
    return quoteLen ? quoteList[quoteLen - 1] : undefined;
  }

  getAllLatestQuotes(): { [key: string]: QuoteItem | undefined } {
    return Object.fromEntries(
      Object.keys(this.quotes).map((isin) => [isin, this.getLatestQuote(isin)])
    );
  }

  toJSON(): QuoteRepositoryData {
    const json: QuoteRepositoryData = {};
    for (const [isin, quoteItems] of Object.entries(this.quotes)) {
      json[isin] = quoteItems.map((item) => item.toJSON());
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

    const quoteItems = this.quotes[isin];

    if (!quoteItems) {
      return;
    }

    // Binary Search algorithm

    let low = 0;
    let high = quoteItems.length - 1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const midItem = quoteItems[mid] as QuoteItem;

      const cmp = compareNormalizedDates(quote.date, midItem.date);

      if (cmp === 0) {
        // Replace existing quote if dates match.
        quoteItems[mid] = quote;
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

    quoteItems.splice(low, 0, quote);
  }
}

export { QuoteRepository };
