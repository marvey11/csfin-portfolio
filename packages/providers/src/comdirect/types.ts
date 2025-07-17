export interface RawQuoteData {
  name: string;
  nsin: string;
  exchange: string;
  items: RawQuoteItem[];
}

export interface RawQuoteItem {
  date: string;
  price: string;
}

export interface RawTransaction {
  executionDate: string;
  nsin: string;
  isin: string;
  name: string;
  type: string;
  shares: string;
  price: string;
  currency: string;
  totalFees: string;
  comdirectID: string;
  exchangeRate: string;
}
