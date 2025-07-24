import {
  BuyTransaction,
  getDateObject,
  parseNumberWithAutoLocale,
  QuoteData,
  QuoteItem,
  SellTransaction,
} from "@csfin-portfolio/core";
import { RawQuoteData, RawQuoteItem, RawTransaction } from "./types/index.js";

const convertToTransaction = (
  data: RawTransaction
): BuyTransaction | SellTransaction => {
  const date = getDateObject(data.executionDate);
  const shares = Math.abs(parseNumberWithAutoLocale(data.shares));
  const pricePerShare = parseNumberWithAutoLocale(data.price);
  const fees = Math.abs(parseNumberWithAutoLocale(data.totalFees));
  // taxes are not listed in the raw transaction data
  const taxes = 0.0;

  if (data.type === "Kauf") {
    return new BuyTransaction(date, shares, pricePerShare, fees);
  }
  if (data.type === "Verkauf") {
    return new SellTransaction(date, shares, pricePerShare, fees, taxes);
  }
  throw new Error(`Invalid raw transaction type: ${data.type}`);
};

const convertToQuoteData = ({
  name,
  nsin,
  exchange,
  items,
}: RawQuoteData): QuoteData => ({
  name,
  nsin,
  exchange,
  items: items.map(convertToQuoteItem),
});

const convertToQuoteItem = ({ date, price }: RawQuoteItem): QuoteItem =>
  new QuoteItem(date, parseNumberWithAutoLocale(price));

export { convertToQuoteData, convertToTransaction };
