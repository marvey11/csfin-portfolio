import { z } from "zod";

const BaseOperationSchema = z.object({
  operationType: z.string(),
  date: z.string(),
  checksum: z.string().length(8),
});

const BaseTransactionSchema = BaseOperationSchema.extend({
  shares: z.number(),
  pricePerShare: z.number(),
  fees: z.number(),
});

const BuyTransactionSchema = BaseTransactionSchema.extend({
  operationType: z.literal("BUY"),
});

const SellTransactionSchema = BaseTransactionSchema.extend({
  operationType: z.literal("SELL"),
  taxes: z.number(),
});

const StockSplitSchema = BaseOperationSchema.extend({
  operationType: z.literal("SPLIT"),
  splitRatio: z.number(),
});

const DividendSchema = BaseOperationSchema.extend({
  operationType: z.literal("DIVIDEND"),
  dividendPerShare: z.number(),
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
