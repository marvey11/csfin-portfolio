import Papa from "papaparse";
import { RawQuoteData, RawQuoteItem, RawTransaction } from "./types";

/**
 * A generic Papa Parse wrapper to simplify parsing with a given configuration.
 *
 * @template T The type of the parsed objects.
 * @param file The CSV file content as a string.
 * @param config The Papa Parse configuration object.
 * @returns The parsed data as an array of objects of type T.
 */
const parseWithConfig = <T>(file: string, config: Papa.ParseConfig<T>): T[] =>
  Papa.parse<T>(file, config).data;

/**
 * Parses a CSV file string containing transaction data from comdirect.
 * It uses a comma as a delimiter and expects a header row which it transforms.
 * @param file The CSV file content as a string.
 * @returns An array of RawTransaction objects.
 */
const parseTransactionData = (file: string): RawTransaction[] => {
  const config: Papa.ParseConfig<RawTransaction> = {
    delimiter: ",",
    skipEmptyLines: true,
    header: true,
    transformHeader: (rawHeader, columnIndex) =>
      transactionHeaderTransformations[columnIndex] || rawHeader,
  };
  return parseWithConfig<RawTransaction>(file, config);
};

const transactionHeaderTransformations: {
  [key: number]: keyof RawTransaction;
} = {
  1: "executionDate",
  2: "nsin",
  3: "isin",
  4: "name",
  5: "type",
  6: "shares",
  7: "price",
  8: "currency",
  11: "totalFees",
  26: "comdirectID",
  27: "exchangeRate",
};

/**
 * Parses a CSV file string containing quote data from comdirect.
 *
 * The file is expected to have a specific format:
 * 1. A metadata header in the first line (e.g., "Stock Name (WKN: 123456 Börse: XETRA)").
 * 2. An empty line.
 * 3. Tabular CSV data for the quote items.
 *
 * @param file The CSV file content as a string.
 * @returns A RawQuoteData object containing the parsed metadata and quote items.
 * @throws An error if the metadata line has an invalid format.
 */
const parseQuoteData = (file: string): RawQuoteData => {
  const firstLine = file.substring(0, file.indexOf("\n"));

  // This regex is designed to be robust and handle the specific metadata format.
  // It captures: 1. Stock Name, 2. WKN/NSIN, 3. Exchange Name
  const metaRegex = /^"?(.*?)\s*\(WKN:\s*([A-Z0-9]{6})\s*B.rse:\s*(.*)\)"?$/i;
  const matches = firstLine.match(metaRegex);

  if (!matches || matches.length < 4) {
    throw new Error("Invalid quote metadata format");
  }

  const [, name, nsin, exchange] = matches;

  return {
    name: name.trim(),
    nsin: nsin.trim(),
    exchange: exchange.trim(),
    items: parseQuoteItems(file),
  };
};

/**
 * Parses the tabular data part of a comdirect quote CSV.
 * It skips the first two lines (metadata and empty line), expects a header,
 * and uses a semicolon as a delimiter.
 *
 * @param file The CSV file content as a string.
 * @returns An array of RawQuoteItem objects.
 */
const parseQuoteItems = (file: string): RawQuoteItem[] => {
  const config: Papa.ParseConfig<RawQuoteItem> = {
    delimiter: ";",
    skipEmptyLines: true,
    skipFirstNLines: 2,
    header: true,
    transformHeader: (rawHeader, columnIndex) =>
      quoteDataHeaderTransformations[columnIndex] || rawHeader,
  };
  return parseWithConfig<RawQuoteItem>(file, config);
};

const quoteDataHeaderTransformations: { [key: number]: keyof RawQuoteItem } = {
  0: "date",
  4: "price",
};

export { parseQuoteData, parseQuoteItems, parseTransactionData };
