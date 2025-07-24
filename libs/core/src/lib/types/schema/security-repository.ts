import { z } from "zod";
import { SecuritySchema } from "./security.js";

const SecurityRepositorySchema = z.array(SecuritySchema);

type SecurityRepositoryData = z.infer<typeof SecurityRepositorySchema>;

export { SecurityRepositorySchema };
export type { SecurityRepositoryData };
