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

    const transactions = this.repository[isin];
    if (!transactions) {
      return;
    }

    transactions.push(transaction);
  }

  getTransactions(isin: string): RawTransaction[] {
    return (
      isin in this.repository ? this.repository[isin] : []
    ) as RawTransaction[];
  }
}

export { RawTransactionRepository };
export type { RawTransaction };
