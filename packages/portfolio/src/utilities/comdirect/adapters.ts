import { Transaction } from "../../types";
import { getDateObject } from "../dateutils";
import { parseNumberWithAutoLocale } from "../numberutils";
import { RawTransaction } from "./types";

const convertToTransaction = (data: RawTransaction): Transaction => {
  const { executionDate, type, shares, price, totalFees } = data;
  return new Transaction(
    getDateObject(executionDate),
    type === "Kauf" ? "BUY" : "SELL",
    // when selling shares, the amount is listed in negavtive numbers; we need to reverse that
    Math.abs(parseNumberWithAutoLocale(shares)),
    parseNumberWithAutoLocale(price),
    null, // stock exchange is not listed
    // fees are listed in negative numbers; we need to reverse that
    Math.abs(parseNumberWithAutoLocale(totalFees))
  );
};

export { convertToTransaction };
