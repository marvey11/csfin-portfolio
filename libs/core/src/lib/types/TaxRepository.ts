import { TaxRepositoryData, TaxRepositorySchema } from "./schema/index.js";

class TaxRepository {
  static fromJSON(data: unknown): TaxRepository {
    const validatedData = TaxRepositorySchema.parse(data);

    const repo = new TaxRepository();

    for (const [countryCode, taxRate] of Object.entries(
      validatedData["withholding-tax"]
    )) {
      repo.addWithholdingTaxRate(countryCode, taxRate);
    }

    return repo;
  }

  private withholdingTaxRates: { [key: string]: number };

  constructor() {
    this.withholdingTaxRates = {};
  }

  addWithholdingTaxRate(countryCode: string, rate: number): void {
    this.withholdingTaxRates[countryCode] = rate;
  }

  getWithholdingTaxRate(countryCode: string): number | undefined {
    return this.withholdingTaxRates[countryCode];
  }

  toJSON(): TaxRepositoryData {
    return {
      "withholding-tax": this.withholdingTaxRates,
    };
  }
}

export { TaxRepository };
