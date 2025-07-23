import {
  BuyTransaction,
  Dividend,
  OperationDataSchema,
  PortfolioOperation,
  SellTransaction,
  StockSplit,
} from "../types";
import { getDateObject } from "./dateutils";

const deserializeOperation = (data: unknown): PortfolioOperation => {
  const validatedData = OperationDataSchema.parse(data);

  const date = getDateObject(validatedData.date);

  switch (validatedData.operationType) {
    case "DIVIDEND": {
      return new Dividend(date, validatedData.dividendPerShare);
    }

    case "SPLIT": {
      return new StockSplit(date, validatedData.splitRatio);
    }

    case "BUY": {
      return new BuyTransaction(
        date,
        validatedData.shares,
        validatedData.pricePerShare,
        validatedData.fees
      );
    }

    case "SELL": {
      return new SellTransaction(
        date,
        validatedData.shares,
        validatedData.pricePerShare,
        validatedData.fees,
        validatedData.taxes
      );
    }
  }
};

export { deserializeOperation };
