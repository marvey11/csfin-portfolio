import { z } from "zod";
import { OperationDataSchema } from "./operation";

const OperationRepositorySchema = z.record(
  z.string().length(12),
  z.array(OperationDataSchema)
);

type OperationRepositoryData = z.infer<typeof OperationRepositorySchema>;

export { OperationRepositorySchema };
export type { OperationRepositoryData };
