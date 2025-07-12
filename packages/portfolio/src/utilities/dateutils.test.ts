import { isValidISODateString } from "./dateutils";

describe("Test suite for dateutils", () => {
  it("should pass basic tests for valid dates", () => {
    expect(isValidISODateString("2025-07-13")).toStrictEqual(true);
    expect(isValidISODateString("2024-02-29")).toStrictEqual(true); // leap year
    expect(isValidISODateString("2023-01-01")).toStrictEqual(true);
    expect(isValidISODateString("1999-12-31")).toStrictEqual(true);
  });

  it("should correctly recognise semantically incorrect dates", () => {
    expect(isValidISODateString("2023-02-29")).toStrictEqual(false);
    expect(isValidISODateString("2023-04-31")).toStrictEqual(false);
    expect(isValidISODateString("2023-13-01")).toStrictEqual(false);
    expect(isValidISODateString("2023-01-00")).toStrictEqual(false);
    expect(isValidISODateString("2023-01-32")).toStrictEqual(false);
  });

  it("should correctly recognise incorrect format strings", () => {
    expect(isValidISODateString("")).toStrictEqual(false);
    expect(isValidISODateString("Not a date")).toStrictEqual(false);
    expect(isValidISODateString("2025-07-13T10:00:00Z")).toStrictEqual(false);
    expect(isValidISODateString("2025-07-1")).toStrictEqual(false);
    expect(isValidISODateString("2025-7-13")).toStrictEqual(false);
    expect(isValidISODateString("2025/07/13")).toStrictEqual(false);
  });
});
