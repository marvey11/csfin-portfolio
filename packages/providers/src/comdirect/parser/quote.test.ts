import { parseRawQuoteData } from "./quote";

describe("Test Suite for the parseRawQuoteData function", () => {
  const validCsvContent =
    `"Fictional Inc.(WKN: ABC123 Börse: Tradegate)"\n` +
    `\n` +
    `Datum;Zeit;Eröffnung;Tageshoch;Tagestief;Schlusskurs;Volumen\n` +
    `16.07.2024;17:34:42;974,50;986,50;969,00;981,00;1.234\n` +
    `15.07.2024;17:35:12;960,00;975,00;958,00;972,00;5.678\n`;

  it("should correctly parse a valid quote file", () => {
    const result = parseRawQuoteData(validCsvContent);

    // Test metadata parsing
    expect(result.name).toBe("Fictional Inc.");
    expect(result.nsin).toBe("ABC123");
    expect(result.exchange).toBe("Tradegate");

    // Test item parsing
    expect(result.items).toHaveLength(2);
    expect(result.items[0]).toEqual(
      expect.objectContaining({
        date: "16.07.2024",
        price: "969,00",
      })
    );
    expect(result.items[1]).toEqual(
      expect.objectContaining({
        date: "15.07.2024",
        price: "958,00",
      })
    );
  });

  it("should throw an error for malformed metadata", () => {
    const fileContent = `"Invalid Metadata"\n\nDatum;Zeit;...`;
    expect(() => parseRawQuoteData(fileContent)).toThrow(
      "Invalid quote metadata format"
    );
  });

  it("should handle a file with only metadata and no items", () => {
    const fileContent = `"Fictional Inc.(WKN: ABC123 Börse: Tradegate)"\n\n`;
    const result = parseRawQuoteData(fileContent);

    expect(result.name).toBe("Fictional Inc.");
    expect(result.items).toHaveLength(0);
  });

  it("should throw an error for an empty input file", () => {
    const fileContent = "";
    expect(() => parseRawQuoteData(fileContent)).toThrow(
      "Invalid quote metadata format"
    );
  });
});
