import { z } from "zod";
import { CountryCodeSchema, IsinStringSchema } from "./zod-schema-types.js";

const SecuritySchema = z.object({
  isin: IsinStringSchema,
  nsin: z.string().length(6),
  name: z.string().min(1),
  country: z.string().min(1),
  countryCode: CountryCodeSchema,
});

type SecurityData = z.infer<typeof SecuritySchema>;

export { SecuritySchema };
export type { SecurityData };
