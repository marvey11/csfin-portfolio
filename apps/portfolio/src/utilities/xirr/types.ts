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

const allEvalTypes = ["net", "gross"] as const;
type EvalType = (typeof allEvalTypes)[number];

export { allEvalTypes };
export type { CashFlow, EvalType };
