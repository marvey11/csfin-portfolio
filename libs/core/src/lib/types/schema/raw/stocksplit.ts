import { z } from "zod";
import { DateStringSchema, IsinStringSchema } from "../zod-schema-types.js";

const RawStockSplitSchema = z.object({
  splitDate: DateStringSchema,
  splitRatio: z.number().positive(),
});

const RawStockSplitRecordSchema = z.record(
  IsinStringSchema,
  z.array(RawStockSplitSchema)
);

type RawStockSplitData = z.infer<typeof RawStockSplitSchema>;
type RawStockSplitListData = z.infer<typeof RawStockSplitRecordSchema>;

export { RawStockSplitRecordSchema, RawStockSplitSchema };
export type { RawStockSplitData, RawStockSplitListData };
