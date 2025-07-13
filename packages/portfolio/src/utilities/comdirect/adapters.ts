import { getISODateStringFromFormatted, getNumberFromFormatted } from "..";
import { Transaction } from "../../types";
import { AbrechnungsdatenSchema } from "./types";

const convertToTransaction = (data: AbrechnungsdatenSchema): Transaction =>
  new Transaction(
    getISODateStringFromFormatted(data["Datum Ausführung"]),
    data.Geschäftsart === "Kauf" ? "BUY" : "SELL",
    Math.abs(getNumberFromFormatted(data["Stücke/Nom."])),
    getNumberFromFormatted(data["Kurs"]),
    // stock exchange is not listed
    null,
    // fees are listed in negative numbers, so we need to reverse that
    -getNumberFromFormatted(data["Entgelt (Summe eigen und fremd) EUR"])
  );

export { convertToTransaction };
