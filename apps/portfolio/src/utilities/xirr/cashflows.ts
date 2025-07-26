import {
  BuyTransaction,
  Dividend,
  EvalType,
  OperationRepository,
  PortfolioOperation,
  QuoteItem,
  SellTransaction,
  SortedList,
} from "@csfin-portfolio/core";
import { CashFlow } from "./types.js";

const getCashflowsForPortfolio = (
  operationsRepository: OperationRepository,
  evalType: EvalType,
  currentValue: number,
  currentDate: Date
) => {
  const cashflows = new SortedList<CashFlow>((a, b) => {
    return a.cashDate.getTime() - b.cashDate.getTime();
  });

  for (const operationsList of Object.values(operationsRepository.data)) {
    const converted = convertOperations(operationsList, evalType);
    converted.toArray().forEach((cashflow) => {
      cashflows.add(cashflow);
    });
  }

  cashflows.add({
    cashDate: currentDate,
    cashAmount: currentValue,
  });

  return cashflows;
};

const getCashflowsForHolding = (
  operations: SortedList<PortfolioOperation>,
  evalType: EvalType,
  currentShares = 0,
  currentQuote?: QuoteItem | undefined
) => {
  const cashflows = convertOperations(operations, evalType);

  if (currentShares > 0) {
    if (!currentQuote) {
      throw new Error("Current quote cannot be undefined if shares are held.");
    }

    cashflows.add({
      cashDate: currentQuote.date,
      cashAmount: currentShares * currentQuote.price,
    });
  }

  return cashflows;
};

const convertOperations = (
  operations: SortedList<PortfolioOperation>,
  evalType: EvalType
): SortedList<CashFlow> => {
  if (operations.size === 0) {
    throw new Error("Operations list cannot be empty");
  }

  const result = new SortedList<CashFlow>((a, b) => {
    return a.cashDate.getTime() - b.cashDate.getTime();
  });

  for (const operation of operations.toArray()) {
    const { date: cashDate, operationType } = operation;

    let cashAmount: number;

    switch (operationType) {
      case "BUY": {
        const { shares, pricePerShare, fees } = operation as BuyTransaction;
        cashAmount =
          -1 * shares * pricePerShare - (evalType === "net" ? fees : 0.0);
        break;
      }

      case "SELL": {
        const { shares, pricePerShare, fees, taxes } =
          operation as SellTransaction;
        cashAmount =
          shares * pricePerShare - (evalType === "net" ? fees + taxes : 0.0);
        break;
      }

      case "DIVIDEND": {
        const { dividendPerShare, applicableShares, exchangeRate, taxes } =
          operation as Dividend;
        cashAmount =
          (dividendPerShare * applicableShares) / (exchangeRate ?? 1) -
          (evalType === "net" ? taxes : 0.0);
        break;
      }

      default: {
        // ignore other operation types
        continue;
      }
    }

    result.add({ cashDate, cashAmount });
  }

  return result;
};

export { getCashflowsForHolding, getCashflowsForPortfolio };
