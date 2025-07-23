import { z } from "zod";
import { QuoteItemSchema } from "./quote";

const QuoteRepositorySchema = z.record(
  z.string().length(12),
  z.array(QuoteItemSchema)
);

type QuoteRepositoryData = z.infer<typeof QuoteRepositorySchema>;

export { QuoteRepositorySchema };
export type { QuoteRepositoryData };
