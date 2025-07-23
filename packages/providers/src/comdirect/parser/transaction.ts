import { RawTransaction } from "../types";
import { parseWithConfig } from "./parser";

/**
 * Parses a CSV file string containing transaction data from comdirect.
 * It uses a comma as a delimiter and expects a header row which it transforms.
 *
 * @param file The CSV file content as a string.
 * @returns An array of RawTransaction objects.
 */
const parseRawTransactionData = (file: string): RawTransaction[] => {
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

export { parseRawTransactionData };
