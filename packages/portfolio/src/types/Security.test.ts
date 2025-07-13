import { Security } from "./Security";

describe("Test suite for Security", () => {
  it("should pass basic tests", () => {
    const security = new Security("DE1234567890", "123456", "Fictional Inc.");
    expect(security.isin).toBe("DE1234567890");
    expect(security.nsin).toBe("123456");
    expect(security.name).toBe("Fictional Inc.");
  });
});
