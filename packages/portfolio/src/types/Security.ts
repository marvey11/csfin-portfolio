class Security {
  /** The security's International Securities Identification Number. */
  isin: string;

  /** The security's National Securities Identification Number (WKN in Germany). */
  nsin: string;

  /** The stock's name. */
  name: string;

  constructor(isin: string, nsin: string, name: string) {
    this.isin = isin;
    this.nsin = nsin;
    this.name = name;
  }
}

export { Security };
