import {
  getDateObject,
  Portfolio,
  QuoteRepository,
  Security,
  SecurityRepository,
} from "@csfin-toolkit/core";
import fs from "node:fs";
import { calculateAnnualizedReturns } from "./utilities";
import {
  convertToTransaction,
  parseTransactionData,
} from "./utilities/comdirect";

const file = fs.readFileSync("./data.csv", "utf8");

const securities = new SecurityRepository();
securities.add("NL0010273215", "A1J4U4", "ASML Holding NV");
securities.add("US55354G1004", "A0M63R", "MSCI Inc");

const quotes = new QuoteRepository();
quotes.add("NL0010273215", "2025-07-11", 684.6);
quotes.add("US55354G1004", "2025-07-11", 483.7);

const portfolio = new Portfolio();

const parsedData = parseTransactionData(file);
parsedData.sort(
  (a, b) =>
    getDateObject(a.executionDate).getTime() -
    getDateObject(b.executionDate).getTime()
);

parsedData.forEach((t) => {
  const { isin, nsin, name } = t;

  let security: Security;
  const found = securities.get(isin);
  if (found) {
    security = found;
  } else {
    security = new Security(isin, nsin, name);
    securities.add(security);
  }

  const tx = convertToTransaction(t);

  return portfolio.addTransaction(security, tx);
});

for (const position of portfolio.getAllPositions()) {
  console.log(position.toString());

  const isin = position.security.isin;

  const transactions = position.getTransactions();

  const latestQuote = quotes.getLatestQuote(isin);

  const xirrGross = calculateAnnualizedReturns(
    "gross",
    transactions,
    latestQuote
  );
  console.log(`= XIRR (Gross): ${(100 * xirrGross).toFixed(2)}%`);

  const xirrNet = calculateAnnualizedReturns("net", transactions, latestQuote);
  console.log(`= XIRR (Net): ${(100 * xirrNet).toFixed(2)}%`);
  console.log("---");
}
