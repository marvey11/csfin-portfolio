import { z } from "zod";
import { DateStringSchema } from "./zod-schema-types.js";

const BaseOperationSchema = z.object({
  operationType: z.string(),
  date: DateStringSchema,
  checksum: z.string().length(8),
});

const BaseTransactionSchema = BaseOperationSchema.extend({
  shares: z.number().positive(),
  pricePerShare: z.number().positive(),
  fees: z.number().nonnegative(),
});

const BuyTransactionSchema = BaseTransactionSchema.extend({
  operationType: z.literal("BUY"),
});

const SellTransactionSchema = BaseTransactionSchema.extend({
  operationType: z.literal("SELL"),
  taxes: z.number().nonnegative(),
});

const StockSplitSchema = BaseOperationSchema.extend({
  operationType: z.literal("SPLIT"),
  splitRatio: z.number().positive(),
});

const DividendSchema = BaseOperationSchema.extend({
  operationType: z.literal("DIVIDEND"),
  dividendPerShare: z.number().positive(),
  applicableShares: z.number().positive(),
  exchangeRate: z.number().positive().optional().default(1),
  taxes: z.number().nonnegative().optional().default(0),
});

const OperationDataSchema = z.discriminatedUnion("operationType", [
  BuyTransactionSchema,
  SellTransactionSchema,
  StockSplitSchema,
  DividendSchema,
]);

type BaseOperationData = z.infer<typeof BaseOperationSchema>;
type BaseTransactionData = z.infer<typeof BaseTransactionSchema>;
type BuyTransactionData = z.infer<typeof BuyTransactionSchema>;
type SellTransactionData = z.infer<typeof SellTransactionSchema>;
type StockSplitData = z.infer<typeof StockSplitSchema>;
type DividendData = z.infer<typeof DividendSchema>;
type AnyOperationData = z.infer<typeof OperationDataSchema>;

export { OperationDataSchema };
export type {
  AnyOperationData,
  BaseOperationData,
  BaseTransactionData,
  BuyTransactionData,
  DividendData,
  SellTransactionData,
  StockSplitData,
};
