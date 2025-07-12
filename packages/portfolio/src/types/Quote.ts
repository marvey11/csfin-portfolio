import { getDateObject } from "../utilities/dateutils";

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

export { QuoteItem };
