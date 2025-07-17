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

class SecurityRepository {
  public static fromData(): SecurityRepository {
    const repo = new SecurityRepository();

    // TODO: deserialise securities --> to be implemented in issue #21

    return repo;
  }

  private securities: Security[];

  constructor() {
    this.securities = [];
  }

  add(security: Security): void;
  add(isin: string, nsin: string, name: string): void;
  add(securityOrISIN: Security | string, nsin?: string, name?: string) {
    if (
      typeof securityOrISIN === "object" &&
      securityOrISIN instanceof Security
    ) {
      this.checkBeforeAdding(securityOrISIN);
    } else if (
      typeof securityOrISIN === "string" &&
      typeof nsin === "string" &&
      typeof name === "string"
    ) {
      this.checkBeforeAdding(new Security(securityOrISIN, nsin, name));
    } else {
      throw new Error(
        "Invalid arguments for add. Expected Security object or the security's ISIN, NSIN, and name parameters."
      );
    }
  }

  has(isin: string): boolean {
    return this.securities.findIndex((obj) => obj.isin === isin) >= 0;
  }

  get(isin: string): Security | undefined {
    return this.securities.find((obj) => obj.isin === isin);
  }

  getByNSIN(nsin: string): Security | undefined {
    return this.securities.find((obj) => obj.nsin === nsin);
  }

  /**
   * Before adding a new security, checks whether it is already stored (based on the security's
   * ISIN). Will ignore the security if it already is stored in this repository.
   *
   * @param security The security to add.
   */
  private checkBeforeAdding(security: Security) {
    const isin = security.isin;
    if (this.has(isin)) {
      console.warn(`Security with ISIN ${isin} already stored. Ignored...`);
    } else {
      // only add if not yet stored
      this.securities.push(security);
    }
  }
}

export { Security, SecurityRepository };
