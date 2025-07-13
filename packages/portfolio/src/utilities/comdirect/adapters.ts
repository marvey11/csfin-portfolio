import { Transaction } from "../../types";
import { getDateObject } from "../dateutils";
import { getNumberFromFormatted } from "../numberutils";
import { AbrechnungsdatenSchema } from "./types";

const convertToTransaction = (data: AbrechnungsdatenSchema): Transaction =>
  new Transaction(
    getDateObject(data["Datum Ausführung"]),
    data.Geschäftsart === "Kauf" ? "BUY" : "SELL",
    Math.abs(getNumberFromFormatted(data["Stücke/Nom."])),
    getNumberFromFormatted(data["Kurs"]),
    null, // stock exchange is not listed
    // fees are listed in negative numbers, so we need to reverse that
    -getNumberFromFormatted(data["Entgelt (Summe eigen und fremd) EUR"])
  );

export { convertToTransaction };
