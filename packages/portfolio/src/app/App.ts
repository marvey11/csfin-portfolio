import {
  getDateObject,
  Portfolio,
  QuoteRepository,
  Security,
  SecurityRepository,
} from "@csfin-toolkit/core";
import fs from "node:fs";
import { ConfigurationSchema } from "../config";
import { calculateAnnualizedReturns } from "../utilities";
import {
  convertToTransaction,
  parseTransactionData,
} from "../utilities/comdirect";

class App {
  private config: ConfigurationSchema;

  constructor(config: ConfigurationSchema) {
    this.config = config;
  }

  run() {
    console.log(
      `>>> Reading data from directory: ${this.config.dataDirectory}\n`
    );

    const file = fs.readFileSync("../99-temp/data.csv", "utf8");

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
      const xirrNet = calculateAnnualizedReturns(
        "net",
        transactions,
        latestQuote
      );
      console.log(
        `= XIRR: ${(100 * xirrGross).toFixed(2)}% (gross), ${(
          100 * xirrNet
        ).toFixed(2)}% (net)`
      );

      console.log();
    }
  }
}

export { App };
