const displayAsPercent = (value: number, fractionDigits?: number): string =>
  `${(100 * value).toFixed(fractionDigits)}%`;

export { displayAsPercent };
