interface StockSplitJSON {
  splitDate: string;
  splitRatio: number;
  checksum?: string;
}

const isStockSplitJSON = (obj: unknown): obj is StockSplitJSON => {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }

  const potential = obj as { [key: string]: unknown };

  return (
    "splitDate" in potential &&
    typeof potential.splitDate === "string" &&
    "splitRatio" in potential &&
    typeof potential.splitRatio === "number" &&
    (!("checksum" in potential) ||
      ("checksum" in potential && typeof potential.checksum === "string"))
  );
};

interface StockSplitRepositoryJSON {
  [key: string]: StockSplitJSON[];
}

const isStockSplitRepositoryJSON = (
  obj: unknown
): obj is StockSplitRepositoryJSON => {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }

  const potential = obj as { [key: string]: unknown };

  return Object.entries(potential).every(
    ([key, value]) =>
      typeof key === "string" &&
      Array.isArray(value) &&
      value.every(isStockSplitJSON)
  );
};

export { isStockSplitJSON, isStockSplitRepositoryJSON };
export type { StockSplitJSON, StockSplitRepositoryJSON };
