import z from "zod";

const RawSecuritySchema = z.object({
  isin: z.string().length(12),
  nsin: z.string().length(6),
  name: z.string().min(1),
});

const RawSecurityListSchema = z.array(RawSecuritySchema);

type RawSecurityData = z.infer<typeof RawSecuritySchema>;
type RawSecurityListData = z.infer<typeof RawSecurityListSchema>;

export { RawSecurityListSchema, RawSecuritySchema };
export type { RawSecurityData, RawSecurityListData };
