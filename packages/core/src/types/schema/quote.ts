import { z } from "zod";

const QuoteItemSchema = z.object({
  date: z.string(),
  price: z.number(),
});

type QuoteItemData = z.infer<typeof QuoteItemSchema>;

export { QuoteItemSchema };
export type { QuoteItemData };
