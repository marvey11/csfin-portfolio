import * as dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envVarsSchema = z.object({
  CSFIN_DATA_DIRECTORY: z.string(),
  STOCK_METADATA_FILE_NAME: z.string().optional(),
  TRANSACTION_DIR_NAME: z.string().optional(),
  QUOTES_DIR_NAME: z.string().optional(),
});

interface ConfigurationSchema {
  dataDirectory: string;
  metadataFileName: string;
  transactionDirName: string;
  quotesDirName: string;
}

class Config {
  private config: ConfigurationSchema | null;

  constructor() {
    this.config = null;
  }

  async load() {
    let envVars: z.infer<typeof envVarsSchema>;

    try {
      envVars = envVarsSchema.parse(process.env);
    } catch (error) {
      console.error("❌ Invalid environment variables:", error);
      console.error("Please check your .env file or deployment environment.");
      process.exit(1);
    }

    this.config = {
      dataDirectory: envVars.CSFIN_DATA_DIRECTORY,
      metadataFileName:
        envVars.STOCK_METADATA_FILE_NAME ?? "stock-metadata.json",
      transactionDirName: envVars.TRANSACTION_DIR_NAME ?? "transactions",
      quotesDirName: envVars.QUOTES_DIR_NAME ?? "quotes",
    };

    return this.config;
  }
}

export { Config };
export type { ConfigurationSchema };
