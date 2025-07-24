import { z } from "zod";
import { CurrencySchema, IsinStringSchema } from "./zod-schema-types.js";

const SecuritySchema = z.object({
  isin: IsinStringSchema,
  nsin: z.string().length(6),
  name: z.string().min(1),
  country: z.string().min(1),
  countryCode: z.string().regex(/^[A-Z]{2}$/),
  currency: CurrencySchema,
});

type SecurityData = z.infer<typeof SecuritySchema>;

export { SecuritySchema };
export type { SecurityData };
