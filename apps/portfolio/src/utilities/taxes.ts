import { roundCurrency } from "@csfin-portfolio/core";

const calculateEffectiveDividendTax = (
  withholdingTaxRate: number | undefined,
  dividendPerShare: number,
  shares: number,
  exchangeRate = 1
): number => {
  if (!withholdingTaxRate) {
    return 0;
  }

  const grossDividend = (dividendPerShare * shares) / (exchangeRate ?? 1);

  const effectiveTaxRate = withholdingTaxRate + (0.25 - 0.15) * (1 + 0.055);

  return roundCurrency(grossDividend * effectiveTaxRate);
};

export { calculateEffectiveDividendTax };
