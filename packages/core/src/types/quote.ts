import { getDateObject } from "../utils";

interface QuoteData {
  name: string;
  nsin: string;
  exchange: string;
  items: QuoteItem[];
}

class QuoteItem {
  private date: Date;
  private price: number;

  constructor(date: string | Date, price: number) {
    this.date = getDateObject(date);
    this.price = price;
  }

  getDate(): Date {
    return this.date;
  }

  getPrice(): number {
    return this.price;
  }
}

class QuoteRepository {
  public static fromData(): QuoteRepository {
    const repo = new QuoteRepository();

    // TODO: deserialise quotes --> to be implemented in issue #21

    return repo;
  }

  private quotes: { [key: string]: QuoteItem[] };

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
    if (isin in this.quotes) {
      const isinQuotes = [...this.quotes[isin]];
      isinQuotes.sort((a, b) => b.getDate().getTime() - a.getDate().getTime());
      return isinQuotes.length ? isinQuotes[0] : undefined;
    }
    return undefined;
  }

  private addQuoteItem(isin: string, quote: QuoteItem) {
    if (!(isin in this.quotes)) {
      this.quotes[isin] = [];
    }

    const newDate = quote.getDate();
    const existingQuoteIndex = this.quotes[isin].findIndex((q) => {
      const currentDate = q.getDate();
      return (
        currentDate.getFullYear() === newDate.getFullYear() &&
        currentDate.getMonth() === newDate.getMonth() &&
        currentDate.getDate() === newDate.getDate()
      );
    });

    if (existingQuoteIndex !== -1) {
      // Replace existing quote for the same day to ensure data is up-to-date.
      this.quotes[isin][existingQuoteIndex] = quote;
    } else {
      // Add new quote if no entry for this day exists.
      this.quotes[isin].push(quote);
    }
  }

  toString(): string {
    return `> Quotes: ${
      Object.keys(this.quotes).length
    } ISINs stored, ${Object.values(this.quotes).reduce(
      (count, quoteArray) => count + quoteArray.length,
      0
    )} quotes stored\n`;
  }
}

export { QuoteItem, QuoteRepository, type QuoteData };
