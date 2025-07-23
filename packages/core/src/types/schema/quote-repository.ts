import { z } from "zod";
import { QuoteItemSchema } from "./quote";
import { IsinStringSchema } from "./zod-schema-types";

const QuoteRepositorySchema = z.record(
  IsinStringSchema,
  z.array(QuoteItemSchema)
);

type QuoteRepositoryData = z.infer<typeof QuoteRepositorySchema>;

export { QuoteRepositorySchema };
export type { QuoteRepositoryData };
