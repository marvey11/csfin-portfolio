import * as dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envVarsSchema = z.object({
  CSFIN_DATA_DIRECTORY: z.string(),
  JSON_APPDATA_FILE_NAME: z.string().optional(),
  RAW_TRANSACTION_DATA_DIR_NAME: z.string().optional(),
  RAW_QUOTE_DATA_DIR_NAME: z.string().optional(),
});

interface ConfigurationSchema {
  dataDirectory: string;
  jsonAppdataFileName: string;
  rawTransactionDataDirName: string;
  rawQuoteDataDirName: string;
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
      jsonAppdataFileName: envVars.JSON_APPDATA_FILE_NAME ?? "appdata.json",
      rawTransactionDataDirName:
        envVars.RAW_TRANSACTION_DATA_DIR_NAME ?? "transactions",
      rawQuoteDataDirName: envVars.RAW_QUOTE_DATA_DIR_NAME ?? "quotes",
    };

    return this.config;
  }
}

export { Config };
export type { ConfigurationSchema };
