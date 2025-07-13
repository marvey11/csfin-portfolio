type AbrechnungsdatenSchema = {
  "Datum Ausführung": string;
  WKN: string;
  ISIN: string;
  Bezeichnung: string;
  Geschäftsart: string;
  "Stücke/Nom.": string;
  Kurs: string;
  Währung: string;
  "Kurswert EUR": string;
  "Kundenendbetrag EUR": string;
  "Entgelt (Summe eigen und fremd) EUR": string;
  Ordernummer: string;
  Devisenkurs: string;
};

export type { AbrechnungsdatenSchema };
