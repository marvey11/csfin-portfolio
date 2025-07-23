import { z } from "zod";
import { DateStringSchema } from "./zod-schema-types";

const QuoteItemSchema = z.object({
  date: DateStringSchema,
  price: z.number().positive(),
});

type QuoteItemData = z.infer<typeof QuoteItemSchema>;

export { QuoteItemSchema };
export type { QuoteItemData };
