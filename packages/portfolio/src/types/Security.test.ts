import { Security } from "./Security";

describe("Test suite for Security", () => {
  it("should pass basic tests", () => {
    expect(new Security("DE1234567890", "123456", "Fictional Inc.").isin).toBe(
      "DE1234567890"
    );
  });
});
