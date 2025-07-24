import { OperationRepository } from "./OperationRepository.js";
import { QuoteRepository } from "./QuoteRepository.js";
import {
  ApplicationRepositoryData,
  ApplicationRepositorySchema,
} from "./schema/index.js";
import { SecurityRepository } from "./SecurityRepository.js";

class ApplicationRepository {
  static fromJSON(data: unknown): ApplicationRepository {
    const validatedData = ApplicationRepositorySchema.parse(data);

    const operations = OperationRepository.fromJSON(validatedData.operations);

    return new ApplicationRepository(
      SecurityRepository.fromJSON(validatedData.securities),
      QuoteRepository.fromJSON(validatedData.quotes),
      operations
    );
  }

  securities: SecurityRepository;
  quotes: QuoteRepository;
  operations: OperationRepository;

  constructor(
    securities: SecurityRepository,
    quotes: QuoteRepository,
    operations: OperationRepository
  ) {
    this.securities = securities;
    this.quotes = quotes;
    this.operations = operations;
  }

  toJSON(): ApplicationRepositoryData {
    return {
      securities: this.securities.toJSON(),
      quotes: this.quotes.toJSON(),
      operations: this.operations.toJSON(),
    };
  }
}

export { ApplicationRepository };
