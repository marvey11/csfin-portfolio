import * as dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envVarsSchema = z.object({
  CSFIN_DATA_DIRECTORY: z.string(),
});

interface ConfigurationSchema {
  dataDirectory: string;
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
    };

    return this.config;
  }
}

export { Config };
export type { ConfigurationSchema };
