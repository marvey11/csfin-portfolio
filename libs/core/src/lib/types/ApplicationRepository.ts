import { OperationRepository } from "./OperationRepository.js";
import { QuoteRepository } from "./QuoteRepository.js";
import {
  ApplicationRepositoryData,
  ApplicationRepositorySchema,
} from "./schema/index.js";
import { SecurityRepository } from "./SecurityRepository.js";
import { TaxRepository } from "./TaxRepository.js";

class ApplicationRepository {
  static fromJSON(data: unknown): ApplicationRepository {
    const validatedData = ApplicationRepositorySchema.parse(data);

    const operations = OperationRepository.fromJSON(validatedData.operations);

    return new ApplicationRepository(
      SecurityRepository.fromJSON(validatedData.securities),
      QuoteRepository.fromJSON(validatedData.quotes),
      operations,
      TaxRepository.fromJSON(validatedData.taxdata)
    );
  }

  securities: SecurityRepository;
  quotes: QuoteRepository;
  operations: OperationRepository;
  taxData: TaxRepository;

  constructor(
    securities: SecurityRepository,
    quotes: QuoteRepository,
    operations: OperationRepository,
    taxData: TaxRepository
  ) {
    this.securities = securities;
    this.quotes = quotes;
    this.operations = operations;
    this.taxData = taxData;
  }

  getTaxRateForISIN(isin: string): number | undefined {
    const security = this.securities.getBy("isin", isin);

    return security
      ? this.taxData.getWithholdingTaxRate(security.countryCode)
      : undefined;
  }

  toJSON(): ApplicationRepositoryData {
    return {
      securities: this.securities.toJSON(),
      quotes: this.quotes.toJSON(),
      operations: this.operations.toJSON(),
      taxdata: this.taxData.toJSON(),
    };
  }
}

export { ApplicationRepository };
