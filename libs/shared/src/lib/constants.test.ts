import { FLOATING_POINT_TOLERANCE } from "./constants.js";

describe("Dummy Test Suite", () => {
  it("should pass a dummy test", () => {
    expect(FLOATING_POINT_TOLERANCE).toBeCloseTo(0.000001);
  });
});
