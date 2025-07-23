import { Currency } from "./Currency";

interface Security {
  /** The security's International Securities Identification Number. */
  isin: string;

  /** The security's National Securities Identification Number (WKN in Germany). */
  nsin: string;

  /** The stock's name. */
  name: string;

  /** The stock's country of origin. */
  country: string;

  /** The stock's two-letter country code, like DE, FR, US. */
  countryCode: string;

  /** The stock's currency. */
  currency: Currency;
}

export type { Security };
