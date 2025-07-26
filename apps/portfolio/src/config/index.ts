import * as dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envVarsSchema = z.object({
  CSFIN_DATA_DIRECTORY: z.string(),
  JSON_APPDATA_FILE_NAME: z.string().optional(),
  JSON_STOCK_METADATA_FILE_NAME: z.string().optional(),
  JSON_DIVIDEND_DATA_FILE_NAME: z.string().optional(),
  JSON_STOCK_SPLITS_FILE_NAME: z.string().optional(),
  JSON_TAX_DATA_FILE_NAME: z.string().optional(),
  RAW_TRANSACTION_DATA_DIR_NAME: z.string().optional(),
  RAW_QUOTE_DATA_DIR_NAME: z.string().optional(),
});

interface ConfigurationSchema {
  dataDirectory: string;
  jsonAppdataFileName: string;
  jsonStockMetadataFileName: string;
  jsonDividendDataFileName: string;
  jsonStockSplitsFileName: string;
  jsonTaxDataFileName: string;
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
      jsonAppdataFileName:
        envVars.JSON_APPDATA_FILE_NAME ?? "application-data.json",
      jsonStockMetadataFileName:
        envVars.JSON_STOCK_METADATA_FILE_NAME ?? "stock-metadata.json",
      jsonDividendDataFileName:
        envVars.JSON_DIVIDEND_DATA_FILE_NAME ?? "dividend-data.json",
      jsonStockSplitsFileName:
        envVars.JSON_STOCK_SPLITS_FILE_NAME ?? "stock-split-data.json",
      jsonTaxDataFileName: envVars.JSON_TAX_DATA_FILE_NAME ?? "tax-data.json",
      rawTransactionDataDirName:
        envVars.RAW_TRANSACTION_DATA_DIR_NAME ?? "transactions",
      rawQuoteDataDirName: envVars.RAW_QUOTE_DATA_DIR_NAME ?? "quotes",
    };

    return this.config;
  }
}

export { Config };
export type { ConfigurationSchema };
