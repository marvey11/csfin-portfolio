import z from "zod";
import { CurrencySchema, IsinStringSchema } from "../zod-schema-types";

const RawSecuritySchema = z.object({
  isin: IsinStringSchema,
  nsin: z.string().length(6),
  name: z.string().min(1),
  country: z.string().min(1),
  countryCode: z.string().regex(/^[A-Z]{2}$/),
  currency: CurrencySchema,
});

const RawSecurityListSchema = z.array(RawSecuritySchema);

type RawSecurityData = z.infer<typeof RawSecuritySchema>;
type RawSecurityListData = z.infer<typeof RawSecurityListSchema>;

export { RawSecurityListSchema, RawSecuritySchema };
export type { RawSecurityData, RawSecurityListData };
