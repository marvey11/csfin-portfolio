import {
  ApplicationRepository,
  Dividend,
  formatCurrency,
  formatNormalizedDate,
  formatPercent,
  isEffectivelyZero,
  Portfolio,
  RawDividendRecordListSchema,
  RawSecurityListSchema,
  RawStockSplitRecordSchema,
  resolvePath,
  SortedList,
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
import chalk from "chalk";
import { readdir, readFile, writeFile } from "node:fs/promises";
import * as path from "node:path";
import { ConfigurationSchema } from "../config/index.js";
import {
  allEvalTypes,
  calculateXIRR,
  CashFlow,
  EvalType,
  getCashflowsForHolding,
  getCashflowsForPortfolio,
} from "../utilities/index.js";

const line = `${"-".repeat(80)}\n`;

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

    console.log(line);

    console.log("-- Loading application data...");
    const appdata = await this.loadApplicationData();

    console.log("-- Applying updates from raw data...");
    await this.applyUpdatesFromRawData(appdata);

    console.log("-- Evaluating all Portfolio holdings...");
    console.log();
    console.log(line);

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

      const currentValue = holding.shares * (latestQuote?.price ?? 0);
      const absoluteGains = currentValue - holding.totalCostBasis;

      console.log(
        `>> Current Value: ${formatCurrency(
          currentValue
        )} -> W/L: ${this.getColoredValueString(
          absoluteGains,
          formatCurrency
        )} | ${this.getColoredValueString(
          isEffectivelyZero(holding.totalCostBasis)
            ? 0
            : absoluteGains / holding.totalCostBasis,
          formatPercent
        )}`
      );

      const cashflowFn = (evalType: EvalType) =>
        getCashflowsForHolding(
          operations,
          evalType,
          holding.shares,
          latestQuote
        );
      console.log(`== XIRR: ${this.getXIRREvaluation(cashflowFn)}\n`);
    }

    console.log(line);

    console.log(portfolio.toString());

    const allLatestQuotes = appdata.quotes.getAllLatestQuotes();
    const latestValue = portfolio.getCurrentValue(allLatestQuotes);
    const absoluteGains = latestValue - portfolio.totalCostBasis;

    console.log(
      `   Total Current Value: ${formatCurrency(
        latestValue
      )} -> W/L: ${this.getColoredValueString(
        absoluteGains,
        formatCurrency
      )} | ${this.getColoredValueString(
        absoluteGains / portfolio.totalCostBasis,
        formatPercent
      )}`
    );

    const latestDate = Object.values(allLatestQuotes).reduce((date, quote) => {
      if (!quote) {
        return date;
      }
      return quote.date.getTime() > date.getTime() ? quote.date : date;
    }, new Date(0));

    const cashflowFn = (evalType: EvalType) =>
      getCashflowsForPortfolio(
        appdata.operations,
        evalType,
        latestValue,
        latestDate
      );
    console.log(`== XIRR: ${this.getXIRREvaluation(cashflowFn)}\n`);

    console.log(line);
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
    await writeFile(jsonPath, JSON.stringify(appdata.toJSON(), null, 2), {
      encoding: "utf8",
    });
  }

  private async applyUpdatesFromRawData(
    appdata: ApplicationRepository
  ): Promise<void> {
    await this.applySecuritiesFromRawData(appdata);

    // parallelising the loading of raw data not depending on each other
    await Promise.all([
      this.applyTransactionsFromRawData(appdata),
      this.applyDividendsFromRawData(appdata),
      this.applyStockSplitsFromRawData(appdata),
      this.applyQuotesFromRawData(appdata),
    ]);
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
    return this.loadFromCsvDirectory(
      this.config.rawTransactionDataDirName,
      () => new RawTransactionRepository(),
      parseRawTransactionData,
      (repo, data) => repo.addAll(data)
    );
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
    return this.loadFromCsvDirectory(
      this.config.rawQuoteDataDirName,
      () => new RawQuoteDataRepository(),
      parseRawQuoteData,
      (repo, data) => repo.add(data)
    );
  }

  private async loadFromCsvDirectory<TRepo, TParsed>(
    dirName: string,
    repositoryFactory: () => TRepo,
    parser: (content: string) => TParsed,
    adder: (repo: TRepo, data: TParsed) => void
  ): Promise<TRepo> {
    const csvRawDataPath = path.join(
      resolvePath(this.config.dataDirectory),
      dirName
    );

    const repository = repositoryFactory();

    const dirents = await readdir(csvRawDataPath, { withFileTypes: true });
    const csvFiles = dirents
      .filter((dirent) => dirent.isFile() && dirent.name.endsWith(".csv"))
      .map((dirent) => dirent.name);

    const parsedDataPromises = csvFiles.map((fileName) =>
      readFile(path.join(csvRawDataPath, fileName), "utf8").then(parser)
    );

    const allParsedData = await Promise.all(parsedDataPromises);

    for (const parsedData of allParsedData) {
      adder(repository, parsedData);
    }

    return repository;
  }

  private createFilePath(fileName: string): string {
    return path.join(resolvePath(this.config.dataDirectory), fileName);
  }

  private getXIRREvaluation(fn: (evalType: EvalType) => SortedList<CashFlow>) {
    return allEvalTypes
      .map(
        (type) =>
          `${this.getColoredValueString(
            calculateXIRR(fn(type)),
            formatPercent
          )} (${type})`
      )
      .join(" | ");
  }

  private getColoredValueString(
    value: number,
    formatter: (value: number) => string
  ) {
    const formatted = formatter(value);
    if (value > 0) {
      return chalk.green(formatted);
    }
    if (value < 0) {
      return chalk.red(formatted);
    }
    return formatted;
  }
}

export { App };
