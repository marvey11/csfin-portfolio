import { formatNormalizedDate, getDateObject } from "../utils";
import { QuoteItemData, QuoteItemSchema } from "./schema";

class QuoteItem {
  static fromJSON(data: unknown): QuoteItem {
    const validatedData = QuoteItemSchema.parse(data);
    return new QuoteItem(validatedData.date, validatedData.price);
  }

  readonly date: Date;
  price: number;

  constructor(date: string | Date, price: number) {
    this.date = getDateObject(date);
    this.price = price;
  }

  toJSON(): QuoteItemData {
    return {
      date: formatNormalizedDate(this.date),
      price: this.price,
    };
  }
}

export { QuoteItem };
