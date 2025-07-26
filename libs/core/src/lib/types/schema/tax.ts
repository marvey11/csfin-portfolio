import { z } from "zod";
import { CountryCodeSchema } from "./zod-schema-types.js";

const WithholdingTaxRecordSchema = z.record(
  CountryCodeSchema,
  z.number().min(0).max(1)
);

type WithholdingTaxRecordData = z.infer<typeof WithholdingTaxRecordSchema>;

export { WithholdingTaxRecordSchema };
export type { WithholdingTaxRecordData };
