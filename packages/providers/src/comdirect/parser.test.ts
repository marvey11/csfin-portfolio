import { parseQuoteData, parseTransactionData } from "./parser";

describe("Test Suite for comdirect parsers", () => {
  describe("Test Suite for parseTransactionData", () => {
    const validCsvContent =
      `Abrechnungstag,Datum Ausführung,WKN,ISIN,Bezeichnung,Geschäftsart,Stücke/Nom.,Kurs,Währung,Kurswert EUR,Kundenendbetrag EUR,Entgelt (Summe eigen und fremd),Orderprovision,börsenplatzabhängiges Entgelt,Kanalzuschlag,Umschreibeentgelt,"Abwicklungsentgelt ""Clearstream"" / ""Streifband""",Regulärer Ausgabeaufschlag,Fremde Spesen,Maklercourtage,Lieferspesen,Börsenspesen,Transaktionssteuer(n) EUR,Versandpauschale,Rücknahmeabschlag,Bonifikation Kunde,Ordernummer,Devisenkurs\n` +
      `01.03.2023,01.03.2023,ABC123,DE0000ABC1230,"Fiction Inc. EO ,10",Kauf,0.127,579.900,EUR,-73.65,-74.76,-1.11,-1.11,,,,,,,,,,,,,,0058792664350,0.00000\n` +
      `01.06.2023,01.06.2023,ABC123,DE0000ABC1230,"Fiction Inc. EO ,10",Kauf,0.145,678.300,EUR,-98.35,-99.83,-1.48,-1.48,,,,,,,,,,,,,,0150796619000,0.00000\n`;

    it("should correctly parse a valid transaction file", () => {
      const result = parseTransactionData(validCsvContent);
      expect(result).toHaveLength(2);

      expect(result[0]).toEqual(
        expect.objectContaining({
          executionDate: "01.03.2023",
          nsin: "ABC123",
          isin: "DE0000ABC1230",
          name: "Fiction Inc. EO ,10",
          type: "Kauf",
          shares: "0.127",
          price: "579.900",
          currency: "EUR",
          totalFees: "-1.11",
          comdirectID: "0058792664350",
          exchangeRate: "0.00000",
        })
      );
      expect(result[1]).toEqual(
        expect.objectContaining({
          executionDate: "01.06.2023",
          nsin: "ABC123",
          isin: "DE0000ABC1230",
          name: "Fiction Inc. EO ,10",
          type: "Kauf",
          shares: "0.145",
          price: "678.300",
          currency: "EUR",
          totalFees: "-1.48",
          comdirectID: "0150796619000",
          exchangeRate: "0.00000",
        })
      );
    });

    it("should return an empty array for an input file with only the header row", () => {
      const fileContent = `executionDate,nsin,isin,name,type,shares,price,currency,totalFees,comdirectID,exchangeRate\n`;
      const result = parseTransactionData(fileContent);
      expect(result).toHaveLength(0);
    });

    it("should return an empty array for an empty input file", () => {
      const fileContent = "";
      const result = parseTransactionData(fileContent);
      expect(result).toHaveLength(0);
    });
  });

  describe("Test Suite for parseQuoteData", () => {
    const validCsvContent =
      `"Fictional Inc.(WKN: ABC123 Börse: Tradegate)"\n` +
      `\n` +
      `Datum;Zeit;Eröffnung;Tageshoch;Tagestief;Schlusskurs;Volumen\n` +
      `16.07.2024;17:34:42;974,50;986,50;969,00;981,00;1.234\n` +
      `15.07.2024;17:35:12;960,00;975,00;958,00;972,00;5.678\n`;

    it("should correctly parse a valid quote file", () => {
      const result = parseQuoteData(validCsvContent);

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
      expect(() => parseQuoteData(fileContent)).toThrow(
        "Invalid quote metadata format"
      );
    });

    it("should handle a file with only metadata and no items", () => {
      const fileContent = `"Fictional Inc.(WKN: ABC123 Börse: Tradegate)"\n\n`;
      const result = parseQuoteData(fileContent);

      expect(result.name).toBe("Fictional Inc.");
      expect(result.items).toHaveLength(0);
    });

    it("should throw an error for an empty input file", () => {
      const fileContent = "";
      expect(() => parseQuoteData(fileContent)).toThrow(
        "Invalid quote metadata format"
      );
    });
  });
});
