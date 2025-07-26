import { z } from "zod";
import { CountryCodeSchema } from "../zod-schema-types.js";

const RawTaxRateSchema = z.record(CountryCodeSchema, z.number().min(0).max(1));

const RawTaxRecordSchema = z.object({ "withholding-tax": RawTaxRateSchema });

type RawTaxRateData = z.infer<typeof RawTaxRateSchema>;
type RawTaxRecordData = z.infer<typeof RawTaxRecordSchema>;

export { RawTaxRateSchema, RawTaxRecordSchema };
export type { RawTaxRateData, RawTaxRecordData };
