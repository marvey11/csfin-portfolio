import { QuoteItem } from "@csfin-toolkit/core";

/**
 * Represents a
 */
interface QuoteData {
  name: string;
  nsin: string;
  exchange: string;
  items: QuoteItem[];
}

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

interface RawTransaction {
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

export type { QuoteData, RawQuoteData, RawQuoteItem, RawTransaction };
