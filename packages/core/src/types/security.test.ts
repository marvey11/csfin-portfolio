import { SecurityRepository } from "./security";

describe("Test Suite for securities", () => {
  describe("Test suite for Security", () => {
    it("should pass basic tests", () => {
      const security = {
        isin: "DE1234567890",
        nsin: "123456",
        name: "Fictional Inc.",
      };
      expect(security.isin).toStrictEqual("DE1234567890");
      expect(security.nsin).toStrictEqual("123456");
      expect(security.name).toStrictEqual("Fictional Inc.");
    });
  });

  describe("Test Suite for SecurityRepository", () => {
    it("should pass basic tests", () => {
      const repo = new SecurityRepository();
      expect(repo.has("isin", "DE1234567890")).toStrictEqual(false);
    });

    it("should be able to add securities as objects", () => {
      const repo = new SecurityRepository();
      repo.add({
        isin: "DE1234567890",
        nsin: "123456",
        name: "Fictional Inc.",
      });
      expect(repo.has("isin", "DE1234567890")).toStrictEqual(true);

      expect(repo.getBy("isin", "DE1234567890")).toBeDefined();
      expect(repo.getBy("isin", "DE1234567890")?.isin).toStrictEqual(
        "DE1234567890"
      );
      expect(repo.getBy("isin", "DE1234567890")?.nsin).toStrictEqual("123456");
      expect(repo.getBy("isin", "DE1234567890")?.name).toStrictEqual(
        "Fictional Inc."
      );
    });

    it("should be able to add securities as their component parameters", () => {
      const repo = new SecurityRepository();
      repo.add("DE1234567890", "123456", "Fictional Inc.");
      expect(repo.has("isin", "DE1234567890")).toStrictEqual(true);

      expect(repo.getBy("isin", "DE1234567890")).toBeDefined();
      expect(repo.getBy("isin", "DE1234567890")?.isin).toStrictEqual(
        "DE1234567890"
      );
      expect(repo.getBy("isin", "DE1234567890")?.nsin).toStrictEqual("123456");
      expect(repo.getBy("isin", "DE1234567890")?.name).toStrictEqual(
        "Fictional Inc."
      );
    });

    it("should not add a security with a duplicate ISIN or NSIN", () => {
      const repo = new SecurityRepository();
      const consoleWarnSpy = vi
        .spyOn(console, "warn")
        .mockImplementation(() => {
          // Do nothing
        });

      // Add initial security
      repo.add("DE1234567890", "123456", "Fictional Inc.");
      expect(repo.getAll()).toHaveLength(1);

      // Attempt to add with duplicate ISIN
      repo.add("DE1234567890", "654321", "Another Inc.");
      expect(repo.getAll()).toHaveLength(1);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "Security with ISIN DE1234567890 already stored. Ignored..."
      );

      // Attempt to add with duplicate NSIN
      repo.add("US0987654321", "123456", "Imaginary Co.");
      expect(repo.getAll()).toHaveLength(1);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "Security with NSIN 123456 already stored. Ignored..."
      );

      consoleWarnSpy.mockRestore();
    });
  });

  it("should correctly serialize and deserialize securities", () => {
    const repo = new SecurityRepository();

    const security1 = {
      isin: "DE1234567890",
      nsin: "123456",
      name: "Fictional Inc.",
    };
    const security2 = {
      isin: "US0987654321",
      nsin: "654321",
      name: "Imaginary Co.",
    };

    repo.add(security1);
    repo.add(security2);

    const serialized = repo.toJSON();
    const deserialized = SecurityRepository.fromJSON(serialized);
    expect(deserialized.getAll()).toEqual(repo.getAll());
  });
});
