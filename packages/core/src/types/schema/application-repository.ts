import { z } from "zod";
import { OperationRepositorySchema } from "./operation-repository";
import { QuoteRepositorySchema } from "./quote-repository";
import { SecurityRepositorySchema } from "./security-repository";

const ApplicationRepositorySchema = z.object({
  securities: SecurityRepositorySchema,
  quotes: QuoteRepositorySchema,
  operations: OperationRepositorySchema,
});

type ApplicationRepositoryData = z.infer<typeof ApplicationRepositorySchema>;

export { ApplicationRepositorySchema };
export type { ApplicationRepositoryData };
