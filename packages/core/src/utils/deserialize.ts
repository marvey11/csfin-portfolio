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
      const { dividendPerShare, applicableShares, exchangeRate } =
        validatedData;
      return new Dividend(
        date,
        dividendPerShare,
        applicableShares,
        exchangeRate
      );
    }

    case "SPLIT": {
      return new StockSplit(date, validatedData.splitRatio);
    }

    case "BUY": {
      const { shares, pricePerShare, fees } = validatedData;
      return new BuyTransaction(date, shares, pricePerShare, fees);
    }

    case "SELL": {
      const { shares, pricePerShare, fees, taxes } = validatedData;
      return new SellTransaction(date, shares, pricePerShare, fees, taxes);
    }
  }
};

export { deserializeOperation };
