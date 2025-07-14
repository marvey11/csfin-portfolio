import { Security, SecurityRepository } from "./security";

describe("Test Suite for securities", () => {
  describe("Test suite for Security", () => {
    it("should pass basic tests", () => {
      const security = new Security("DE1234567890", "123456", "Fictional Inc.");
      expect(security.isin).toBe("DE1234567890");
      expect(security.nsin).toBe("123456");
      expect(security.name).toBe("Fictional Inc.");
    });
  });

  describe("Test Suite for SecurityRepository", () => {
    it("should pass basic tests", () => {
      const repo = new SecurityRepository();
      expect(repo.has("DE1234567890")).toStrictEqual(false);
    });

    it("should be able to add securities as objects", () => {
      const repo = new SecurityRepository();
      repo.add(new Security("DE1234567890", "123456", "Fictional Inc."));
      expect(repo.has("DE1234567890")).toStrictEqual(true);

      expect(repo.get("DE1234567890")).toBeDefined();
      expect(repo.get("DE1234567890")?.isin).toStrictEqual("DE1234567890");
      expect(repo.get("DE1234567890")?.nsin).toStrictEqual("123456");
      expect(repo.get("DE1234567890")?.name).toStrictEqual("Fictional Inc.");
    });

    it("should be able to add securities as their component parameters", () => {
      const repo = new SecurityRepository();
      repo.add("DE1234567890", "123456", "Fictional Inc.");
      expect(repo.has("DE1234567890")).toStrictEqual(true);

      expect(repo.get("DE1234567890")).toBeDefined();
      expect(repo.get("DE1234567890")?.isin).toStrictEqual("DE1234567890");
      expect(repo.get("DE1234567890")?.nsin).toStrictEqual("123456");
      expect(repo.get("DE1234567890")?.name).toStrictEqual("Fictional Inc.");
    });
  });
});
