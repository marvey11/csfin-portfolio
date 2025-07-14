import Papa from "papaparse";
import { RawTransaction } from "./types";

const parseTransactionData = (file: string): RawTransaction[] =>
  Papa.parse<RawTransaction>(file, {
    delimiter: ",",
    skipEmptyLines: true,
    header: true,
    transformHeader: (rawHeader, columnIndex) =>
      columnIndex in headerTransformations
        ? (headerTransformations[columnIndex] as string)
        : rawHeader,
  }).data;

const headerTransformations: { [key: number]: keyof RawTransaction } = {
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

export { parseTransactionData };
