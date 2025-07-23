import { Security } from "./Security";
import { SecurityRepository } from "./SecurityRepository";

describe("Test Suite for the SecurityRepository class", () => {
  const isin = "DE1234567890";

  const security: Security = {
    isin,
    nsin: "123456",
    name: "Fictional Inc.",
  };

  let repo: SecurityRepository;

  beforeEach(() => {
    repo = new SecurityRepository();
  });

  it("should pass basic tests", () => {
    expect(repo.has("isin", isin)).toStrictEqual(false);
  });

  describe("add method", () => {
    it("should be able to add securities as objects", () => {
      repo.add(security);
      expect(repo.has("isin", isin)).toStrictEqual(true);

      expect(repo.getBy("isin", isin)).toBeDefined();
      expect(repo.getBy("isin", isin)?.isin).toStrictEqual(isin);
      expect(repo.getBy("isin", isin)?.nsin).toStrictEqual("123456");
      expect(repo.getBy("isin", isin)?.name).toStrictEqual("Fictional Inc.");
    });

    it("should be able to add securities as their component parameters", () => {
      repo.add(isin, "123456", "Fictional Inc.");
      expect(repo.has("isin", isin)).toStrictEqual(true);

      expect(repo.getBy("isin", isin)).toBeDefined();
      expect(repo.getBy("isin", isin)?.isin).toStrictEqual(isin);
      expect(repo.getBy("isin", isin)?.nsin).toStrictEqual("123456");
      expect(repo.getBy("isin", isin)?.name).toStrictEqual("Fictional Inc.");
    });

    it("should not add a security with a duplicate ISIN or NSIN", () => {
      // Add initial security
      repo.add(isin, "123456", "Fictional Inc.");
      expect(repo.getAll()).toHaveLength(1);

      // Attempt to add with duplicate ISIN
      repo.add(isin, "654321", "Another Inc.");
      expect(repo.getAll()).toHaveLength(1);

      // Attempt to add with duplicate NSIN
      repo.add("US0987654321", "123456", "Imaginary Co.");
      expect(repo.getAll()).toHaveLength(1);
    });

    it("should throw an exception when supplying invalid arguments", () => {
      const errorMessage = /^Invalid arguments for add./;

      expect(() => {
        repo.add(null as unknown as Security);
      }).toThrow(errorMessage);
      expect(() => {
        repo.add(undefined as unknown as Security);
      }).toThrow(errorMessage);
      expect(() => {
        repo.add({ invalid: "security" } as unknown as Security);
      }).toThrow(errorMessage);

      expect(() => {
        repo.add(undefined as unknown as string, "123456", "Fictional Inc.");
      }).toThrow(errorMessage);
      expect(() => {
        repo.add(isin, undefined as unknown as string, "Fictional Inc.");
      }).toThrow(errorMessage);
      expect(() => {
        repo.add(isin, "123456", undefined as unknown as string);
      }).toThrow(errorMessage);
    });
  });

  describe("toJSON/fromJSON methods (serialise/deserialise)", () => {
    it("should correctly serialize and deserialize securities", () => {
      const security2 = {
        isin: "US0987654321",
        nsin: "654321",
        name: "Imaginary Co.",
      };

      repo.add(security);
      repo.add(security2);

      const serialized = repo.toJSON();
      const deserialized = SecurityRepository.fromJSON(serialized);
      expect(serialized).toEqual(deserialized.toJSON());
    });
  });
});
