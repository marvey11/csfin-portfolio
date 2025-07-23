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

class RawTransactionRepository {
  readonly repository: { [key: string]: RawTransaction[] };

  constructor() {
    this.repository = {};
  }

  addAll(transactions: RawTransaction[]): void {
    transactions.forEach((transaction) => this.add(transaction));
  }

  add(transaction: RawTransaction): void {
    const isin = transaction.isin;

    if (!(isin in this.repository)) {
      this.repository[isin] = [];
    }

    this.repository[isin].push(transaction);
  }

  getTransactions(isin: string): RawTransaction[] {
    if (!(isin in this.repository)) {
      return [];
    }

    return this.repository[isin];
  }
}

export { RawTransactionRepository };
export type { RawTransaction };
