import { getDateObject } from "../utilities";

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
    // TODO: check whether there is already a quote item stored for the ISIN and date
    if (!(isin in this.quotes)) {
      this.quotes[isin] = [];
    }
    this.quotes[isin].push(quote);
  }
}

export { QuoteItem, QuoteRepository };
