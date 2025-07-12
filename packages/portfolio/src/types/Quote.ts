class QuoteItem {
  private date: Date;
  private price: number;

  constructor(date: string, price: number);
  constructor(date: Date, price: number);
  constructor(date: string | Date, price: number) {
    this.date = typeof date === "string" ? new Date(date) : date;
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
