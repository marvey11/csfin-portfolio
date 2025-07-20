interface QuoteItemJSON {
  date: string;
  price: number;
}

const isQuoteItemJSON = (obj: unknown): obj is QuoteItemJSON => {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }

  const potential = obj as { [key: string]: unknown };

  return (
    "date" in potential &&
    typeof potential.date === "string" &&
    "price" in potential &&
    typeof potential.price === "number"
  );
};

interface QuoteRepositoryJSON {
  [key: string]: QuoteItemJSON[];
}

const isQuoteRepositoryJSON = (obj: unknown): obj is QuoteRepositoryJSON => {
  if (typeof obj !== "object" || obj === null) {
    return false;
  }

  const potential = obj as { [key: string]: unknown };

  return Object.entries(potential).every(
    ([key, value]) =>
      typeof key === "string" &&
      Array.isArray(value) &&
      value.every(isQuoteItemJSON)
  );
};

export { isQuoteItemJSON, isQuoteRepositoryJSON };
export type { QuoteItemJSON, QuoteRepositoryJSON };
