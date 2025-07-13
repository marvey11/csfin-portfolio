import fs from "node:fs";
import { Portfolio, QuoteItem, Security } from "./types";
import { calculateAnnualizedReturns, parseTransactions } from "./utilities";

const file = fs.readFileSync("./data.csv", "utf8");

const portfolio = new Portfolio();

const asml = new Security("NL0010273215", "A1J4U4", "ASML Holding NV");

const parsedTransactions = parseTransactions(file);
parsedTransactions.forEach((t) => portfolio.addTransaction(asml, t));

console.log(portfolio.toString());

const transactions = portfolio.getTransactions("NL0010273215");
const quote: QuoteItem = new QuoteItem("2025-07-11", 683.9);

const xirrGross = calculateAnnualizedReturns("gross", transactions, quote);
console.log(`= XIRR (Gross): ${(100 * xirrGross).toFixed(2)}%`);

const xirrNet = calculateAnnualizedReturns("net", transactions, quote);
console.log(`= XIRR (Net): ${(100 * xirrNet).toFixed(2)}%`);
