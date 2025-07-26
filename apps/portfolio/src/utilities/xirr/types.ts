interface CashFlow {
  /** The date of the cashflow. */
  cashDate: Date;

  /**
   * The actual cashflow.
   *
   * Negative cashflows for money leaving the account, positive cashflows for money coming into the account.
   */
  cashAmount: number;
}

export type { CashFlow };
