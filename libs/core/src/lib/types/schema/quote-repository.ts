import { z } from "zod";
import { QuoteItemSchema } from "./quote.js";
import { IsinStringSchema } from "./zod-schema-types.js";

const QuoteRepositorySchema = z.record(
  IsinStringSchema,
  z.array(QuoteItemSchema)
);

type QuoteRepositoryData = z.infer<typeof QuoteRepositorySchema>;

export { QuoteRepositorySchema };
export type { QuoteRepositoryData };
