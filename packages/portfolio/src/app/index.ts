import {
  ApplicationData,
  formatCurrency,
  formatNormalizedDate,
  formatPercent,
  QuoteRepository,
  resolvePath,
  SecurityRepository,
  TransactionRepository,
} from "@csfin-toolkit/core";
import {
  convertToQuoteData,
  convertToTransaction,
  parseQuoteData,
  parseTransactionData,
} from "@csfin-toolkit/providers";
import { readdir, readFile, writeFile } from "node:fs/promises";
import * as path from "node:path";
import { ConfigurationSchema } from "../config";
import { calculateAnnualizedReturns } from "../utilities";

class App {
  private config: ConfigurationSchema;

  constructor(config: ConfigurationSchema) {
    this.config = config;
  }

  async run() {
    console.log(
      `>>> Reading data from directory: ${resolvePath(
        this.config.dataDirectory
      )}\n`
    );

    // const stockSplits: {
    //   [key: string]: { splitDate: Date; splitRatio: number }[];
    // } = {
    //   US02079K1079: [{ splitDate: new Date("2022-07-22"), splitRatio: 20 }],
    //   US0231351067: [{ splitDate: new Date("2022-06-06"), splitRatio: 20 }],
    // };

    const appdata = await this.loadApplicationData();
    await this.applyUpdatesFromRawData(appdata);

    // const transactionRepository = new TransactionRepository();

    // try {
    //   const data = await readJsonFile(
    //     path.join(resolvedDataPath, this.config.jsonTransactionsFileName)
    //   );

    //   if (Array.isArray(data)) {
    //     data.forEach(({ date, type, shares, quote, exchange, fees, taxes }) => {
    //       transactionRepository.add(
    //         new Transaction(
    //           getDateObject(date),
    //           type,
    //           shares,
    //           quote,
    //           exchange,
    //           fees,
    //           taxes
    //         )
    //       );
    //     });
    //   } else {
    //     console.warn("Transactions JSON file is not in the expected format.");
    //   }
    // } catch (error) {
    //   console.error("Error loading transactions from JSON:", error);
    // }

    // const entries = fs.readdirSync(transactionsPath, { withFileTypes: true });
    // for (const entry of entries) {
    //   const fname = entry.name;
    //   if (fname.match(/^[A-Z][A-Z][A-Z0-9]{10}\.csv$/)) {
    //     const csvPath = path.join(transactionsPath, fname);

    //     const value = fs.readFileSync(csvPath, { encoding: "utf8" });
    //     const parsedData = parseTransactionData(value);
    //     parsedData.sort(
    //       (a, b) =>
    //         getDateObject(a.executionDate).getTime() -
    //         getDateObject(b.executionDate).getTime()
    //     );

    //     for (const t of parsedData) {
    //       const { isin } = t;

    //       const security = securityRepository.getBy("isin", isin);
    //       if (security) {
    //         const tx = convertToTransaction(t);
    //         if (isin in stockSplits) {
    //           stockSplits[isin].forEach((splitData) => {
    //             const { splitDate, splitRatio } = splitData;
    //             if (tx.date < splitDate) {
    //               tx.shares = tx.shares * splitRatio;
    //               tx.quote = tx.quote / splitRatio;
    //             }
    //           });
    //         }
    //         portfolio.addTransaction(security, tx);
    //       }
    //     }
    //   }
    // }

    console.log(">>> Evaluating all Portfolio holdings...\n");
    for (const holding of appdata.portfolio.getAllHoldings()) {
      console.log(holding.toString());

      const isin = holding.security.isin;

      const latestQuote = appdata.quotes.getLatestQuote(isin);

      const transactions = holding.getTransactions();

      if (latestQuote) {
        console.log(
          `> Latest Quote: ${formatCurrency(
            latestQuote.price
          )} @ ${formatNormalizedDate(latestQuote.date)}`
        );
      }

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
        `= XIRR: ${formatPercent(xirrGross)} (gross), ${formatPercent(
          xirrNet
        )} (net)`
      );

      console.log();
    }

    await this.saveApplicationData(appdata);
  }

  private async loadApplicationData(): Promise<ApplicationData> {
    console.log(">>> Loading application data...");

    const jsonPath = this.createFilePath(this.config.jsonAppdataFileName);
    const appdata = await readFile(jsonPath, "utf8").then(JSON.parse);
    const parsed = ApplicationData.fromJSON(appdata);

    console.log(">>> Done.\n");

    return parsed;
  }

  private async saveApplicationData(appdata: ApplicationData): Promise<void> {
    console.log(">>> Saving application data...");

    const jsonPath = this.createFilePath(this.config.jsonAppdataFileName);
    writeFile(jsonPath, JSON.stringify(appdata.toJSON(), null, 2), {
      encoding: "utf8",
    });

    console.log(">>> Done.\n");
  }

  private async applyUpdatesFromRawData(
    appdata: ApplicationData
  ): Promise<void> {
    await this.applyTransactionsFromRawData(appdata);
    await this.applyQuotesFromRawData(appdata);
  }

  private async applyTransactionsFromRawData(
    appdata: ApplicationData
  ): Promise<void> {
    const transactionUpdates = await this.loadTransactionsFromRawData(
      appdata.securities
    );

    for (const isin in transactionUpdates.data) {
      const security = appdata.securities.getBy("isin", isin);
      if (!security) {
        throw new Error(`Security with ISIN ${isin} not found`);
      }

      const transactions = transactionUpdates.getTransactions(isin);
      transactions.sort((a, b) => a.date.getTime() - b.date.getTime());

      for (const tx of transactions) {
        appdata.portfolio.addTransaction(security, tx);
      }
    }
  }

  private async loadTransactionsFromRawData(
    securities: SecurityRepository
  ): Promise<TransactionRepository> {
    const csvRawDataPath = path.join(
      resolvePath(this.config.dataDirectory),
      this.config.rawTransactionDataDirName
    );

    const updateRepository = new TransactionRepository();

    const files = await readdir(csvRawDataPath, { withFileTypes: true });

    for (const csvFile of files) {
      if (!(csvFile.isFile() && csvFile.name.endsWith(".csv"))) {
        continue;
      }

      const csvPath = path.join(csvRawDataPath, csvFile.name);

      const value = await readFile(csvPath, "utf8");

      const parsedData = parseTransactionData(value);

      for (const t of parsedData) {
        const security = securities.getBy("isin", t.isin);
        if (security) {
          // ignore transactions for ISINs not in the stock universe
          const tx = convertToTransaction(t);
          updateRepository.add(security.isin, tx);
        }
      }
    }

    return updateRepository;
  }

  private async applyQuotesFromRawData(
    appdata: ApplicationData
  ): Promise<void> {
    const quoteUpdates = await this.loadQuotesFromRawData(appdata.securities);

    for (const isin in quoteUpdates.quotes) {
      for (const quoteItem of quoteUpdates.quotes[isin]) {
        appdata.quotes.add(isin, quoteItem.date, quoteItem.price);
      }
    }
  }

  private async loadQuotesFromRawData(
    securities: SecurityRepository
  ): Promise<QuoteRepository> {
    const csvRawDataPath = path.join(
      resolvePath(this.config.dataDirectory),
      this.config.rawQuoteDataDirName
    );

    const updateRepository = new QuoteRepository();

    const files = await readdir(csvRawDataPath, { withFileTypes: true });

    for (const csvFile of files) {
      if (!(csvFile.isFile() && csvFile.name.endsWith(".csv"))) {
        continue;
      }

      const csvPath = path.join(csvRawDataPath, csvFile.name);

      const value = await readFile(csvPath, "utf8");

      const quoteData = convertToQuoteData(parseQuoteData(value));
      const { nsin, items } = quoteData;

      const security = securities.getBy("nsin", nsin);
      if (security) {
        for (const item of items) {
          updateRepository.add(security.isin, item.date, item.price);
        }
      } else {
        console.warn(
          `Parsed quote data for unknown security (NSIN = ${nsin}). Skipping...`
        );
      }
    }

    return updateRepository;
  }

  private createFilePath(fileName: string): string {
    return path.join(resolvePath(this.config.dataDirectory), fileName);
  }
}

export { App };
