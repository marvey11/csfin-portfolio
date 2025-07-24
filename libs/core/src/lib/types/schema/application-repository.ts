import { z } from "zod";
import { OperationRepositorySchema } from "./operation-repository.js";
import { QuoteRepositorySchema } from "./quote-repository.js";
import { SecurityRepositorySchema } from "./security-repository.js";

const ApplicationRepositorySchema = z.object({
  securities: SecurityRepositorySchema,
  quotes: QuoteRepositorySchema,
  operations: OperationRepositorySchema,
});

type ApplicationRepositoryData = z.infer<typeof ApplicationRepositorySchema>;

export { ApplicationRepositorySchema };
export type { ApplicationRepositoryData };
