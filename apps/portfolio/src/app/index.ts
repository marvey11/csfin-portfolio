import {
  ApplicationRepository,
  Dividend,
  formatCurrency,
  formatNormalizedDate,
  formatPercent,
  Portfolio,
  RawDividendRecordListSchema,
  RawSecurityListSchema,
  RawStockSplitRecordSchema,
  resolvePath,
  StockSplit,
} from "@csfin-portfolio/core";
import {
  convertToQuoteData,
  convertToTransaction,
  parseRawQuoteData,
  parseRawTransactionData,
  RawQuoteDataRepository,
  RawTransactionRepository,
} from "@csfin-portfolio/providers";
import { readdir, readFile, writeFile } from "node:fs/promises";
import * as path from "node:path";
import { ConfigurationSchema } from "../config/index.js";
import { calculateAnnualizedReturns } from "../utilities/index.js";

class App {
  private config: ConfigurationSchema;

  constructor(config: ConfigurationSchema) {
    this.config = config;
  }

  async run() {
    console.log(
      `-- Reading data from directory: ${resolvePath(
        this.config.dataDirectory
      )}\n`
    );

    console.log("-- Loading application data...");
    const appdata = await this.loadApplicationData();

    console.log("-- Applying updates from raw data...");
    await this.applyUpdatesFromRawData(appdata);

    console.log("-- Evaluating all Portfolio holdings...\n");
    this.evaluate(appdata);

    console.log("-- Saving application data...");
    await this.saveApplicationData(appdata);

    console.log("-- Done.\n");
  }

  private evaluate(appdata: ApplicationRepository): void {
    const portfolio = Portfolio.reconstruct(appdata);

    const holdings = portfolio.getAllHoldings();
    holdings.sort((a, b) => a.security.name.localeCompare(b.security.name));

    for (const holding of holdings) {
      console.log(holding.toString());

      const isin = holding.security.isin;

      const operations = appdata.operations.get(isin);

      if (!operations) {
        console.warn(`No operations stored for ISIN ${isin}. Ignoring...`);
        continue;
      }

      const latestQuote = appdata.quotes.getLatestQuote(isin);
      if (latestQuote) {
        console.log(
          `-- Latest Quote: ${formatCurrency(
            latestQuote.price
          )} @ ${formatNormalizedDate(latestQuote.date)}`
        );
      }

      const xirrGross = calculateAnnualizedReturns(
        "gross",
        operations,
        latestQuote
      );
      const xirrNet = calculateAnnualizedReturns(
        "net",
        operations,
        latestQuote
      );
      console.log(
        `== XIRR: ${formatPercent(xirrGross)} (gross), ${formatPercent(
          xirrNet
        )} (net)`
      );

      console.log();
    }

    console.log(
      "--------------------------------------------------------------------------------\n"
    );
    console.log(portfolio.toString());
    console.log(
      "--------------------------------------------------------------------------------\n"
    );
  }

  private async loadApplicationData(): Promise<ApplicationRepository> {
    const jsonPath = this.createFilePath(this.config.jsonAppdataFileName);
    const appdata = await readFile(jsonPath, "utf8").then(JSON.parse);
    return ApplicationRepository.fromJSON(appdata);
  }

  private async saveApplicationData(
    appdata: ApplicationRepository
  ): Promise<void> {
    const jsonPath = this.createFilePath(this.config.jsonAppdataFileName);
    writeFile(jsonPath, JSON.stringify(appdata.toJSON(), null, 2), {
      encoding: "utf8",
    });
  }

  private async applyUpdatesFromRawData(
    appdata: ApplicationRepository
  ): Promise<void> {
    await this.applySecuritiesFromRawData(appdata);
    await this.applyTransactionsFromRawData(appdata);
    await this.applyDividendsFromRawData(appdata);
    await this.applyStockSplitsFromRawData(appdata);
    await this.applyQuotesFromRawData(appdata);
  }

  private async applySecuritiesFromRawData(
    appdata: ApplicationRepository
  ): Promise<void> {
    const jsonPath = this.createFilePath(this.config.jsonStockMetadataFileName);
    const rawStockData = await readFile(jsonPath, "utf8").then(JSON.parse);

    const validatedData = RawSecurityListSchema.parse(rawStockData);
    validatedData.forEach((security) => {
      appdata.securities.add(security);
    });
  }

  private async applyTransactionsFromRawData(
    appdata: ApplicationRepository
  ): Promise<void> {
    const transactionUpdates = await this.loadTransactionsFromRawData();

    for (const isin in transactionUpdates.repository) {
      if (!appdata.securities.getBy("isin", isin)) {
        // ignore any transactions for securities not currently stored
        continue;
      }

      const rawTransactions = transactionUpdates.repository[isin];
      if (!rawTransactions) {
        continue;
      }

      rawTransactions.forEach((rawTransaction) => {
        const transaction = convertToTransaction(rawTransaction);
        appdata.operations.add(isin, transaction);
      });
    }
  }

  private async loadTransactionsFromRawData(): Promise<RawTransactionRepository> {
    const csvRawDataPath = path.join(
      resolvePath(this.config.dataDirectory),
      this.config.rawTransactionDataDirName
    );

    const rawDataRepository = new RawTransactionRepository();

    const files = await readdir(csvRawDataPath, { withFileTypes: true });

    for (const csvFile of files) {
      if (!(csvFile.isFile() && csvFile.name.endsWith(".csv"))) {
        continue;
      }

      const value = await readFile(
        path.join(csvRawDataPath, csvFile.name),
        "utf8"
      );

      const parsedData = parseRawTransactionData(value);
      rawDataRepository.addAll(parsedData);
    }

    return rawDataRepository;
  }

  private async applyDividendsFromRawData(
    appdata: ApplicationRepository
  ): Promise<void> {
    const jsonPath = this.createFilePath(this.config.jsonDividendDataFileName);
    const rawDividendsData = await readFile(jsonPath, "utf8").then(JSON.parse);

    const validatedData = RawDividendRecordListSchema.parse(rawDividendsData);
    for (const rawDividendRecord of validatedData) {
      const { isin, dividends } = rawDividendRecord;
      dividends.forEach(({ date, dividendPerShare, shares, exchangeRate }) => {
        appdata.operations.add(
          isin,
          new Dividend(date, dividendPerShare, shares, exchangeRate)
        );
      });
    }
  }

  private async applyStockSplitsFromRawData(
    appdata: ApplicationRepository
  ): Promise<void> {
    const jsonPath = this.createFilePath(this.config.jsonStockSplitsFileName);
    const rawSplitsData = await readFile(jsonPath, "utf8").then(JSON.parse);

    const validatedData = RawStockSplitRecordSchema.parse(rawSplitsData);
    Object.entries(validatedData).forEach(([isin, splits]) => {
      splits.forEach(({ splitDate, splitRatio }) => {
        appdata.operations.add(isin, new StockSplit(splitDate, splitRatio));
      });
    });
  }

  private async applyQuotesFromRawData(
    appdata: ApplicationRepository
  ): Promise<void> {
    const quoteUpdates = await this.loadQuotesFromRawData();

    for (const [nsin, rawQuotes] of Object.entries(quoteUpdates.repository)) {
      const security = appdata.securities.getBy("nsin", nsin);
      if (!security) {
        console.warn(
          `Could not convert NSIN ${nsin} to ISIN: security not found. Ignoring...`
        );
        continue;
      }

      const quoteData = convertToQuoteData(rawQuotes);
      appdata.quotes.addAll(security.isin, quoteData.items);
    }
  }

  private async loadQuotesFromRawData(): Promise<RawQuoteDataRepository> {
    const csvRawDataPath = path.join(
      resolvePath(this.config.dataDirectory),
      this.config.rawQuoteDataDirName
    );

    const updateRepository = new RawQuoteDataRepository();

    const files = await readdir(csvRawDataPath, { withFileTypes: true });

    for (const csvFile of files) {
      if (!(csvFile.isFile() && csvFile.name.endsWith(".csv"))) {
        continue;
      }

      const value = await readFile(
        path.join(csvRawDataPath, csvFile.name),
        "utf8"
      );

      const parsedData = parseRawQuoteData(value);
      updateRepository.add(parsedData);
    }

    return updateRepository;
  }

  private createFilePath(fileName: string): string {
    return path.join(resolvePath(this.config.dataDirectory), fileName);
  }
}

export { App };
