import { z } from "zod";
import { WithholdingTaxRecordSchema } from "./tax.js";

const TaxRepositorySchema = z.object({
  "withholding-tax": WithholdingTaxRecordSchema,
});

type TaxRepositoryData = z.infer<typeof TaxRepositorySchema>;

export { TaxRepositorySchema };
export type { TaxRepositoryData };
