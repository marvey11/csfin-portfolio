interface RawQuoteData {
  name: string;
  nsin: string;
  exchange: string;
  items: RawQuoteItem[];
}

interface RawQuoteItem {
  date: string;
  price: string;
}

class RawQuoteDataRepository {
  readonly repository: { [key: string]: RawQuoteData };

  constructor() {
    this.repository = {};
  }

  addAll(quoteData: RawQuoteData[]): void {
    quoteData.forEach((quote) => this.add(quote));
  }

  add(quoteData: RawQuoteData): void {
    const nsin = quoteData.nsin;
    this.repository[nsin] = quoteData;
  }
}

export { RawQuoteDataRepository };
export type { RawQuoteData, RawQuoteItem };
