import { z } from "zod";
import { OperationDataSchema } from "./operation";
import { IsinStringSchema } from "./zod-schema-types";

const OperationRepositorySchema = z.record(
  IsinStringSchema,
  z.array(OperationDataSchema)
);

type OperationRepositoryData = z.infer<typeof OperationRepositorySchema>;

export { OperationRepositorySchema };
export type { OperationRepositoryData };
