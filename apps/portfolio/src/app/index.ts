import {
  allEvalTypes,
  ApplicationRepository,
  Dividend,
  EvalType,
  formatCurrency,
  formatNormalizedDate,
  formatPercent,
  isEffectivelyZero,
  Portfolio,
  PortfolioHolding,
  PortfolioOperation,
  RawDividendRecordListSchema,
  RawSecurityListSchema,
  RawStockSplitRecordSchema,
  RawTaxRecordSchema,
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
  calculateEffectiveDividendTax,
  calculateXIRR,
  CashFlow,
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
      const operations = appdata.operations.get(holding.security.isin);

      if (operations) {
        this.printHoldingEvaluation(appdata, holding, operations);
      } else {
        console.warn(
          `⚠️ Warning: No operations stored for ISIN ${holding.security.isin}. Ignoring...`
        );
      }
    }

    this.printPortfolioEvaluation(appdata, portfolio);
  }

  private printHoldingEvaluation(
    appdata: ApplicationRepository,
    holding: PortfolioHolding,
    operations: SortedList<PortfolioOperation>
  ): void {
    const {
      averagePricePerShare,
      security,
      shares,
      totalCostBasis,
      totalDividends,
      totalFees,
      totalRealizedGains,
      dividendTaxes,
    } = holding;

    console.log(
      `-- ${chalk.bold.blueBright(security.name)} (${security.isin} | ${
        security.nsin
      })`
    );
    console.log(`   Shares: ${shares.toFixed(3)}`);
    console.log(
      `   Total Cost: ${formatCurrency(totalCostBasis)} ` +
        `(incl. ${formatCurrency(totalFees)} Fees)`
    );
    console.log(
      `   Average Price per Share: ${formatCurrency(averagePricePerShare)}`
    );
    console.log(
      `   Dividends: ${formatCurrency(
        totalDividends - dividendTaxes
      )} (net) | Taxes: ${formatCurrency(dividendTaxes)}`
    );
    console.log(
      `   Total Realised Gains: ${formatCurrency(totalRealizedGains)}`
    );

    const latestQuote = appdata.quotes.getLatestQuote(security.isin);
    if (latestQuote) {
      console.log(
        `   Latest Quote: ${formatCurrency(
          latestQuote.price
        )} @ ${formatNormalizedDate(latestQuote.date)}`
      );
    }

    const currentValue = shares * (latestQuote?.price ?? 0);
    const absoluteGains = currentValue - totalCostBasis;
    const relativeGains = isEffectivelyZero(totalCostBasis)
      ? 0
      : absoluteGains / totalCostBasis;

    console.log(
      `>> Current Value: ${formatCurrency(
        currentValue
      )} -> W/L: ${this.getColoredValueString(
        absoluteGains,
        formatCurrency
      )} | ${this.getColoredValueString(relativeGains, formatPercent)}`
    );

    const cashflowFn = (evalType: EvalType) =>
      getCashflowsForHolding(operations, evalType, shares, latestQuote);
    console.log(`== XIRR: ${this.getXIRREvalString(cashflowFn)}\n`);

    console.log(line);
  }

  private printPortfolioEvaluation(
    appdata: ApplicationRepository,
    portfolio: Portfolio
  ): void {
    const activeHoldings = portfolio.getActiveHoldings().length;
    const allLatestQuotes = appdata.quotes.getAllLatestQuotes();
    const currentValue = portfolio.getCurrentValue(allLatestQuotes);

    const {
      totalCostBasis,
      totalRealizedGains,
      totalDividends,
      totalDividendTaxes,
      totalFees,
    } = portfolio;

    console.log(
      `-> ${activeHoldings} Active Holdings (plus ${
        portfolio.getAllHoldings().length - activeHoldings
      } inactive)`
    );
    console.log(
      `   Total Cost: ${formatCurrency(totalCostBasis)} (incl. ${formatCurrency(
        totalFees
      )} Fees)`
    );
    console.log(
      `   Total Realized Gains: ${formatCurrency(totalRealizedGains)}`
    );
    console.log(
      `   Total Dividends: ${formatCurrency(
        totalDividends - totalDividendTaxes
      )} (net) | ` +
        `${formatCurrency(totalDividendTaxes)} Taxes, ` +
        `Effective Rate: ${formatPercent(totalDividendTaxes / totalDividends)}`
    );

    const absoluteGains = currentValue - totalCostBasis;
    const relativeGains = isEffectivelyZero(totalCostBasis)
      ? 0
      : absoluteGains / totalCostBasis;

    console.log(
      `>> Total Value: ${formatCurrency(
        currentValue
      )} -> W/L: ${this.getColoredValueString(
        absoluteGains,
        formatCurrency
      )} | ${this.getColoredValueString(relativeGains, formatPercent)}`
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
        currentValue,
        latestDate
      );
    console.log(`== XIRR: ${this.getXIRREvalString(cashflowFn)}\n`);

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
    await Promise.all([
      this.applySecuritiesFromRawData(appdata),
      this.applyTaxRatesFromRawData(appdata),
    ]);

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
        const taxRate = appdata.getTaxRateForISIN(isin);

        const taxes = calculateEffectiveDividendTax(
          taxRate,
          dividendPerShare,
          shares,
          exchangeRate
        );

        appdata.operations.add(
          isin,
          new Dividend(date, dividendPerShare, shares, exchangeRate, taxes)
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

  private async applyTaxRatesFromRawData(
    appdata: ApplicationRepository
  ): Promise<void> {
    const jsonPath = this.createFilePath(this.config.jsonTaxDataFileName);
    const rawTaxData = await readFile(jsonPath, "utf8").then(JSON.parse);

    const validatedData = RawTaxRecordSchema.parse(rawTaxData);
    const taxRates = validatedData["withholding-tax"];
    Object.entries(taxRates).forEach(([countryCode, rate]) => {
      appdata.taxData.addWithholdingTaxRate(countryCode, rate);
    });
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

  private getXIRREvalString(fn: (evalType: EvalType) => SortedList<CashFlow>) {
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
