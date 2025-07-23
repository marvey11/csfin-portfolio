import { z } from "zod";

const SecuritySchema = z.object({
  isin: z.string().length(12),
  nsin: z.string().length(6),
  name: z.string().min(1),
});

type SecurityData = z.infer<typeof SecuritySchema>;

export { SecuritySchema };
export type { SecurityData };
