import { QuoteItem } from "./QuoteItem.js";

interface QuoteData {
  name: string;
  nsin: string;
  exchange: string;
  items: QuoteItem[];
}

export type { QuoteData };
