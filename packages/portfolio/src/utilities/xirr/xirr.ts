import {
  BuyTransaction,
  PortfolioOperation,
  QuoteItem,
  SellTransaction,
  SortedList,
  StockSplit,
} from "@csfin-toolkit/core";
import { CashFlow } from "./types";

const MAX_ITERATIONS = 100;
const TOLERANCE = 1e-6;

/**
 * Evaluates the Money-Weighted Rate of Return (MWRR) using the Extended Internal Rate of Return
 * (XIRR) method for a portfolio position or even a complete portfolio.
 *
 * @param type Can be `net` or `gross`. Specifies whether fees and taxes should be included in the XIRR evaluation (`net`) or not (`gross`).
 * @param operations The list of operations to be used in the evalution.
 * @param quoteItem If the position currently holds shares, a quote item consisting of the latest price and the accompanying date must be specified.
 * @returns The annualised return for this position.
 */
const calculateAnnualizedReturns = (
  type: "net" | "gross",
  operations: SortedList<PortfolioOperation>,
  quoteItem: QuoteItem | null = null
): number => {
  if (operations.size === 0) {
    throw new Error("Transaction list cannot be empty");
  }

  const finalShareCount = operations.toArray().reduce((total, operation) => {
    if (operation.operationType === "BUY") {
      const { shares } = operation as BuyTransaction;
      return total + shares;
    }

    if (operation.operationType === "SELL") {
      const { shares } = operation as SellTransaction;
      if (shares - total > TOLERANCE) {
        throw new Error("Cannot sell more shares than owned");
      }
      return total - shares;
    }

    if (operation.operationType === "SPLIT") {
      const { splitRatio } = operation as StockSplit;
      return total * splitRatio;
    }

    return total;
  }, 0.0);

  if (finalShareCount > TOLERANCE && quoteItem == null) {
    throw Error(
      "Quote Item consisting of a stock price and date must be provided if the number of stocks currently held is not zero."
    );
  }

  // convert the transactions to cashflows, then sort the cashflows by date in ascending order
  const cashflows: CashFlow[] = generateCashflows(type, operations);
  if (finalShareCount > TOLERANCE) {
    const item = quoteItem as QuoteItem;
    cashflows.push({
      cashDate: item.date,
      cashAmount: finalShareCount * item.price,
    });
  }
  cashflows.sort((a, b) => a.cashDate.getTime() - b.cashDate.getTime());

  // get the earliest date in the cashflows
  const startDate = cashflows[0].cashDate;

  const getNetPresentValue = (rate: number): number => {
    let npv = 0;

    for (const { cashDate, cashAmount } of cashflows) {
      npv +=
        cashAmount /
        Math.pow(
          1 + rate,
          (cashDate.getTime() - startDate.getTime()) / (365 * 24 * 3600 * 1000)
        );
    }

    return npv;
  };

  let low = -0.999999;
  let high = 10.0;

  if (getNetPresentValue(low) * getNetPresentValue(high) > 0) {
    let tempLow = low;
    let tempHigh = high;
    let foundBracket = false;

    for (let i = 0; i < 50 && !foundBracket; i++) {
      tempLow = tempLow * 2;
      if (getNetPresentValue(tempLow) * getNetPresentValue(tempHigh) <= 0) {
        low = tempLow;
        foundBracket = true;
      }
    }

    if (!foundBracket) {
      tempLow = low;
      tempHigh = high;
      for (let i = 0; i < 50 && !foundBracket; i++) {
        tempHigh = tempHigh * 2;
        if (getNetPresentValue(tempLow) * getNetPresentValue(tempHigh) <= 0) {
          high = tempHigh;
          foundBracket = true;
        }
      }
    }

    if (!foundBracket) {
      console.warn(
        "Warning: Could not find a rate range that brackets the XIRR. Result may be inaccurate or NaN."
      );
      return NaN; // No clear root found
    }
  }

  let rate = 0;

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    rate = (low + high) / 2;
    const npv = getNetPresentValue(rate);

    if (Math.abs(npv) < TOLERANCE) {
      return rate; // Found the rate within tolerance
    }

    if (npv > 0) {
      low = rate; // XIRR is higher than current 'rate'
    } else {
      high = rate; // XIRR is lower than current 'rate'
    }
  }

  console.warn(
    "Warning: XIRR did not converge within the maximum number of iterations."
  );

  return rate;
};

const generateCashflows = (
  evalType: "net" | "gross",
  operations: SortedList<PortfolioOperation>
): CashFlow[] =>
  operations
    .toArray()
    .filter((operation): operation is BuyTransaction | SellTransaction =>
      ["BUY", "SELL"].includes(operation.operationType)
    )
    .map(({ operationType, date, shares, pricePerShare, fees, taxes }) => {
      const multiplier = operationType === "BUY" ? -1 : 1;

      return {
        cashDate: date,
        cashAmount:
          multiplier * shares * pricePerShare -
          (evalType === "net" ? fees + taxes : 0.0),
      };
    });

export { calculateAnnualizedReturns };
