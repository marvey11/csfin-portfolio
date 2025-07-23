import { QuoteItem } from "./QuoteItem";

interface QuoteData {
  name: string;
  nsin: string;
  exchange: string;
  items: QuoteItem[];
}

export type { QuoteData };
