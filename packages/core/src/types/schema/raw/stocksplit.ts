import { z } from "zod";

const RawStockSplitSchema = z.object({
  splitDate: z.string(),
  splitRatio: z.number(),
});

const RawStockSplitRecordSchema = z.record(
  z.string().length(12),
  z.array(RawStockSplitSchema)
);

type RawStockSplitData = z.infer<typeof RawStockSplitSchema>;
type RawStockSplitListData = z.infer<typeof RawStockSplitRecordSchema>;

export { RawStockSplitRecordSchema, RawStockSplitSchema };
export type { RawStockSplitData, RawStockSplitListData };
