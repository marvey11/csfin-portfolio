import {
  Portfolio,
  QuoteItem,
  Security,
  StockExchange,
  Transaction,
} from "./types";
import { calculateAnnualizedReturns } from "./utilities";

const portfolio = new Portfolio();

const asml = new Security("NL0010273215", "A1J4U4", "ASML Holding NV");

const tradegate = new StockExchange("Tradegate Exchange", "Germany");

// TODO: actually read the transactions from comdirect's "Abrechnungsdaten" CSV file(s)

portfolio.addTransaction(
  asml,
  new Transaction("2023-01-02", "BUY", 0.048, 511.5, tradegate, 0.37)
);
portfolio.addTransaction(
  asml,
  new Transaction("2023-03-12", "BUY", 0.127, 579.9, tradegate, 1.11)
);
portfolio.addTransaction(
  asml,
  new Transaction("2023-06-01", "BUY", 0.145, 678.3, tradegate, 1.48)
);
portfolio.addTransaction(
  asml,
  new Transaction("2023-09-01", "BUY", 0.159, 617.2, tradegate, 1.48)
);
portfolio.addTransaction(
  asml,
  new Transaction("2024-03-25", "BUY", 0.037, 911.8, tradegate, 0.52)
);
portfolio.addTransaction(
  asml,
  new Transaction("2024-04-23", "BUY", 0.029, 821.8, tradegate, 0.37)
);
portfolio.addTransaction(
  asml,
  new Transaction("2024-06-24", "BUY", 0.051, 962, tradegate, 0.74)
);
portfolio.addTransaction(
  asml,
  new Transaction("2024-07-29", "SELL", 0.596, 823, tradegate)
);
portfolio.addTransaction(
  asml,
  new Transaction("2025-03-13", "BUY", 2, 650, tradegate, 12.4)
);

console.log(portfolio.toString());

const transactions = portfolio.getTransactions("NL0010273215");
const quote: QuoteItem = new QuoteItem("2025-07-11", 683.9);

const xirrGross = calculateAnnualizedReturns("gross", transactions, quote);
console.log(`= XIRR (Gross): ${(100 * xirrGross).toFixed(2)}%`);

const xirrNet = calculateAnnualizedReturns("net", transactions, quote);
console.log(`= XIRR (Net): ${(100 * xirrNet).toFixed(2)}%`);
