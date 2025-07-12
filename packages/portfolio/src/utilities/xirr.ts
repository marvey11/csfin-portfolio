import { exit } from "process";

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

const netPresentValue = (rate: number): number => {
  let npv = 0;

  for (const cs of cashflows) {
    const { cashDate, cashAmount } = cs;
    npv +=
      cashAmount /
      Math.pow(
        1 + rate,
        (cashDate.getTime() - startDate.getTime()) / (365 * 24 * 3600 * 1000)
      );
  }

  return npv;
};

const cashflows: CashFlow[] = [
  {
    cashDate: new Date("2023-01-02"),
    cashAmount: -0.048 * 511.5,
  },
  {
    cashDate: new Date("2023-03-12"),
    cashAmount: -0.127 * 579.9,
  },
  {
    cashDate: new Date("2023-06-01"),
    cashAmount: -0.145 * 678.3,
  },
  {
    cashDate: new Date("2023-09-01"),
    cashAmount: -0.159 * 617.2,
  },
  {
    cashDate: new Date("2024-03-25"),
    cashAmount: -0.037 * 911.8,
  },
  {
    cashDate: new Date("2024-04-23"),
    cashAmount: -0.029 * 821.8,
  },
  {
    cashDate: new Date("2024-06-24"),
    cashAmount: -0.051 * 962,
  },
  {
    cashDate: new Date("2024-07-29"),
    cashAmount: 0.596 * 823,
  },
  {
    cashDate: new Date("2025-03-13"),
    cashAmount: -2 * 650,
  },
  {
    // current value
    cashDate: new Date("2025-07-11"),
    cashAmount: 2 * 683.9,
  },
];

const startDate = cashflows[0].cashDate;

const maxIterations = 100;
const tolerance = 1e-4;
let low = -0.999999;
let high = 10.0;
let rate = 0;

if (netPresentValue(low) * netPresentValue(high) > 0) {
  let tempLow = low;
  let tempHigh = high;
  let foundBracket = false;

  for (let i = 0; i < 50 && !foundBracket; i++) {
    tempLow = tempLow * 2;
    if (netPresentValue(tempLow) * netPresentValue(tempHigh) <= 0) {
      low = tempLow;
      foundBracket = true;
    }
  }

  if (!foundBracket) {
    tempLow = low;
    tempHigh = high;
    for (let i = 0; i < 50 && !foundBracket; i++) {
      tempHigh = tempHigh * 2;
      if (netPresentValue(tempLow) * netPresentValue(tempHigh) <= 0) {
        high = tempHigh;
        foundBracket = true;
      }
    }
  }

  if (!foundBracket) {
    console.warn(
      "Warning: Could not find a rate range that brackets the XIRR. Result may be inaccurate or NaN."
    );
    console.log("NO RATE");
    exit();
  }
}

for (let i = 0; i < maxIterations; i++) {
  rate = (low + high) / 2;
  const npv = netPresentValue(rate);

  if (Math.abs(npv) < tolerance) {
    console.log(`RATE: ${(100 * rate).toFixed(2)}% (after ${i} iterations)`); // Found the rate within tolerance
    exit();
  }

  if (npv > 0) {
    low = rate; // XIRR is higher than current 'rate'
  } else {
    high = rate; // XIRR is lower than current 'rate'
  }
}

console.warn(
  "Warning: XIRR did not converge within the maximum number of iterations."
);
