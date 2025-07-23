import { deserializeOperation } from "../utils";
import { PortfolioOperation } from "./PortfolioOperation";
import {
  AnyOperationData,
  OperationRepositoryData,
  OperationRepositorySchema,
} from "./schema";
import { SortedList } from "./utility";

const compareOperations = (a: PortfolioOperation, b: PortfolioOperation) =>
  a.date.getTime() - b.date.getTime();

const getChecksum = (operation: PortfolioOperation) => operation.checksum;

class OperationRepository {
  static fromJSON(data: unknown): OperationRepository {
    const validatedData = OperationRepositorySchema.parse(data);

    const repo = new OperationRepository();

    for (const [isin, operations] of Object.entries(validatedData)) {
      operations.forEach((op) => {
        repo.add(isin, deserializeOperation(op));
      });
    }

    return repo;
  }

  readonly data: { [key: string]: SortedList<PortfolioOperation> };

  constructor() {
    this.data = {};
  }

  add(isin: string, operation: PortfolioOperation): void {
    if (!(isin in this.data)) {
      this.data[isin] = new SortedList<PortfolioOperation>(
        compareOperations,
        getChecksum
      );
    }

    this.data[isin].add(operation);
  }

  get(isin: string): SortedList<PortfolioOperation> | undefined {
    return this.data[isin];
  }

  toJSON(): OperationRepositoryData {
    const json: OperationRepositoryData = {};
    for (const [isin, operations] of Object.entries(this.data)) {
      json[isin] = operations
        .toArray()
        .map((op) => op.toJSON() as AnyOperationData);
    }
    return json;
  }
}

export { OperationRepository };
