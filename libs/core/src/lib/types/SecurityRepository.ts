import {
  SecurityRepositoryData,
  SecurityRepositorySchema,
  SecuritySchema,
} from "./schema/index.js";
import { Security } from "./Security.js";

const isSecurity = (obj: unknown): obj is Security => {
  if (typeof obj !== "object" || obj == null) {
    return false;
  }

  const potential = obj as { [key: string]: unknown };

  return (
    "isin" in potential &&
    typeof potential["isin"] === "string" &&
    "nsin" in potential &&
    typeof potential["nsin"] === "string" &&
    "name" in potential &&
    typeof potential["name"] === "string" &&
    "country" in potential &&
    typeof potential["country"] === "string" &&
    "countryCode" in potential &&
    typeof potential["countryCode"] === "string" &&
    "currency" in potential &&
    typeof potential["currency"] === "string"
  );
};

/**
 * Manages a collection of securities, ensuring no duplicates based on ISIN or NSIN are added.
 */
class SecurityRepository {
  static fromJSON(data: unknown): SecurityRepository {
    const validatedData = SecurityRepositorySchema.parse(data);

    const repo = new SecurityRepository();

    validatedData.forEach((security) => {
      repo.add(security);
    });

    return repo;
  }

  /** The list of securities stored in the repository. */
  readonly securities: Security[];

  /**
   * Creates an instance of SecurityRepository.
   */
  constructor() {
    this.securities = [];
  }

  /**
   * Adds a new security to the repository.
   * The security will not be added if a security with the same ISIN or NSIN already exists.
   *
   * @param security The security object to add.
   */
  add(security: Security): void {
    if (!isSecurity(security)) {
      throw new Error("Invalid arguments for add.");
    }

    const validatedData = SecuritySchema.parse(security);

    const { isin, nsin } = validatedData;
    if (!this.has("isin", isin) && !this.has("nsin", nsin)) {
      // only add if not yet stored
      this.securities.push(security);
    }
  }

  /**
   * Returns a shallow copy of all securities in the repository.
   * @returns An array of all securities.
   */
  getAll(): Security[] {
    return this.securities.slice();
  }

  /**
   * Gets a security by a specific key (ISIN or NSIN).
   * @param key The key to search by, either 'isin' or 'nsin'.
   * @param value The value to search for.
   * @returns The found security or undefined if not found.
   */
  getBy(key: "isin" | "nsin", value: string): Security | undefined {
    return this.findBy(key, value);
  }

  /**
   * Checks if a security exists in the repository by a given property.
   *
   * @param key The property of the Security to search by, either 'isin' or 'nsin'.
   * @param value The value to search for.
   * @returns `true` if a security with the given property and value exists, `false` otherwise.
   */
  has(key: "isin" | "nsin", value: string): boolean {
    return this.findIndexBy(key, value) >= 0;
  }

  /**
   * Serializes the repository's securities to a JSON string.
   * @returns A JSON string representation of the securities.
   */
  toJSON(): SecurityRepositoryData {
    return this.securities;
  }

  /**
   * Finds a security by a given property.
   *
   * @param key The property of the Security to search by.
   * @param value The value to search for.
   * @returns The found `Security` object or `undefined`.
   */
  private findBy(key: keyof Security, value: string): Security | undefined {
    return this.securities.find((security) => security[key] === value);
  }

  /**
   * Finds the index of a security by a given property.
   *
   * @param key The property of the Security to search by.
   * @param value The value to search for.
   * @returns The found index of the security or `-1`.
   */
  private findIndexBy(key: keyof Security, value: string): number {
    return this.securities.findIndex((security) => security[key] === value);
  }
}

export { SecurityRepository };
