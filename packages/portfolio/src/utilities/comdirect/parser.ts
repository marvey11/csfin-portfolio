import Papa from "papaparse";
import { Transaction } from "../../types";
import { convertToTransaction } from "./adapters";
import { AbrechnungsdatenSchema } from "./types";

const parseTransactions = (file: string): Transaction[] => {
  return Papa.parse<AbrechnungsdatenSchema>(file, {
    delimiter: ",",
    header: true,
  }).data.map(convertToTransaction);
};

export { parseTransactions };
