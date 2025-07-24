import { parseRawTransactionData } from "./transaction";

describe("Test Suite for the parseRawTransactionData function", () => {
  const validCsvContent =
    `Abrechnungstag,Datum Ausführung,WKN,ISIN,Bezeichnung,Geschäftsart,Stücke/Nom.,Kurs,Währung,Kurswert EUR,Kundenendbetrag EUR,Entgelt (Summe eigen und fremd),Orderprovision,börsenplatzabhängiges Entgelt,Kanalzuschlag,Umschreibeentgelt,"Abwicklungsentgelt ""Clearstream"" / ""Streifband""",Regulärer Ausgabeaufschlag,Fremde Spesen,Maklercourtage,Lieferspesen,Börsenspesen,Transaktionssteuer(n) EUR,Versandpauschale,Rücknahmeabschlag,Bonifikation Kunde,Ordernummer,Devisenkurs\n` +
    `01.03.2023,01.03.2023,ABC123,DE0000ABC1230,"Fiction Inc. EO ,10",Kauf,0.127,579.900,EUR,-73.65,-74.76,-1.11,-1.11,,,,,,,,,,,,,,0058792664350,0.00000\n` +
    `01.06.2023,01.06.2023,ABC123,DE0000ABC1230,"Fiction Inc. EO ,10",Kauf,0.145,678.300,EUR,-98.35,-99.83,-1.48,-1.48,,,,,,,,,,,,,,0150796619000,0.00000\n`;

  it("should correctly parse a valid transaction file", () => {
    const result = parseRawTransactionData(validCsvContent);
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
    const result = parseRawTransactionData(fileContent);
    expect(result).toHaveLength(0);
  });

  it("should return an empty array for an empty input file", () => {
    const fileContent = "";
    const result = parseRawTransactionData(fileContent);
    expect(result).toHaveLength(0);
  });
});
