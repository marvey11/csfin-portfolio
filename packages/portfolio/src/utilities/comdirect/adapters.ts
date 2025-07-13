import { Transaction } from "../../types";
import { getDateObject } from "../dateutils";
import { parseNumberWithAutoLocale } from "../numberutils";
import { AbrechnungsdatenSchema } from "./types";

const convertToTransaction = (data: AbrechnungsdatenSchema): Transaction =>
  new Transaction(
    getDateObject(data["Datum Ausführung"]),
    data.Geschäftsart === "Kauf" ? "BUY" : "SELL",
    // when selling shares, the amount is listed in negavtive numbers; we need to reverse that
    Math.abs(parseNumberWithAutoLocale(data["Stücke/Nom."])),
    parseNumberWithAutoLocale(data["Kurs"]),
    null, // stock exchange is not listed
    // fees are listed in negative numbers; we need to reverse that
    Math.abs(
      parseNumberWithAutoLocale(data["Entgelt (Summe eigen und fremd) EUR"])
    )
  );

export { convertToTransaction };
