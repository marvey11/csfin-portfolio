import {
  displayAsPercent,
  getDateObject,
  Portfolio,
  QuoteRepository,
  readJsonFile,
  resolvePath,
  SecurityRepository,
} from "@csfin-toolkit/core";
import {
  convertToQuoteData,
  convertToTransaction,
  parseQuoteData,
  parseTransactionData,
} from "@csfin-toolkit/providers";
import * as fs from "node:fs";
import * as path from "node:path";
import { ConfigurationSchema } from "../config";
import { calculateAnnualizedReturns } from "../utilities";

class App {
  private config: ConfigurationSchema;

  constructor(config: ConfigurationSchema) {
    this.config = config;
  }

  async run() {
    const resolvedDataPath = resolvePath(this.config.dataDirectory);

    console.log(`>>> Reading data from directory: ${resolvedDataPath}\n`);

    const securities = new SecurityRepository();

    await readJsonFile(
      path.join(resolvedDataPath, this.config.metadataFileName)
    ).then((data) => {
      if (Array.isArray(data)) {
        data.forEach(({ isin, nsin, name }) => {
          securities.add(isin, nsin, name);
        });
      }
    });

    const stockSplits: {
      [key: string]: { splitDate: Date; splitRatio: 20 }[];
    } = {
      US02079K1079: [{ splitDate: new Date("2022-07-22"), splitRatio: 20 }],
      US0231351067: [{ splitDate: new Date("2022-06-06"), splitRatio: 20 }],
    };

    const portfolio = new Portfolio();

    const transactionsPath = path.join(
      resolvedDataPath,
      this.config.transactionDirName
    );
    const entries = fs.readdirSync(transactionsPath, { withFileTypes: true });
    for (const entry of entries) {
      const fname = entry.name;
      if (fname.match(/^[A-Z][A-Z][A-Z0-9]{10}\.csv$/)) {
        const csvPath = path.join(transactionsPath, fname);

        const value = fs.readFileSync(csvPath, { encoding: "utf8" });
        const parsedData = parseTransactionData(value);
        parsedData.sort(
          (a, b) =>
            getDateObject(a.executionDate).getTime() -
            getDateObject(b.executionDate).getTime()
        );

        for (const t of parsedData) {
          const { isin } = t;

          const security = securities.get(isin);
          if (security) {
            const tx = convertToTransaction(t);
            if (isin in stockSplits) {
              stockSplits[isin].forEach((splitData) => {
                const { splitDate, splitRatio } = splitData;
                if (tx.date < splitDate) {
                  tx.shares = tx.shares * splitRatio;
                  tx.quote = tx.quote / splitRatio;
                }
              });
            }
            portfolio.addTransaction(security, tx);
          }
        }
      }
    }

    const quotesRepository = new QuoteRepository();

    const quotesPath = path.join(resolvedDataPath, this.config.quotesDirName);
    const rawQuoteDataFiles = fs.readdirSync(quotesPath, {
      withFileTypes: true,
    });
    for (const csvQuoteDataFile of rawQuoteDataFiles) {
      const fname = csvQuoteDataFile.name;

      if (!fname.match(/\.csv$/)) {
        continue;
      }

      const csvPath = path.join(quotesPath, fname);

      const value = fs.readFileSync(csvPath, { encoding: "utf8" });
      const quoteData = convertToQuoteData(parseQuoteData(value));

      const { nsin, items } = quoteData;

      const security = securities.getByNSIN(nsin);
      if (security) {
        for (const item of items) {
          quotesRepository.add(security.isin, item.getDate(), item.getPrice());
        }
      } else {
        console.warn(
          `Parsed quote data for unknown security (NSIN = ${nsin}). Skipping...`
        );
      }
    }

    console.log(">>> Evaluating all Portfolio positions");
    for (const position of portfolio.getAllPositions()) {
      console.log(position.toString());

      const isin = position.security.isin;

      const transactions = position.getTransactions();

      const latestQuote = quotesRepository.getLatestQuote(isin);

      console.log(
        `> Latest Quote: ${latestQuote?.getPrice()} @ ${latestQuote
          ?.getDate()
          .toISOString()}`
      );

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
        `= XIRR: ${displayAsPercent(xirrGross, 2)} (gross), ${displayAsPercent(
          xirrNet,
          2
        )} (net)`
      );

      console.log();
    }
  }
}

export { App };
