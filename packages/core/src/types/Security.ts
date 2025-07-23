interface Security {
  /** The security's International Securities Identification Number. */
  isin: string;

  /** The security's National Securities Identification Number (WKN in Germany). */
  nsin: string;

  /** The stock's name. */
  name: string;
}

export type { Security };
