const currencyFormatOptions: Intl.NumberFormatOptions = {
  style: "currency",
  currency: "EUR",
};

/**
 * Formats a number as currency.
 *
 * If no locale is specified, uses "en-GB" to use the decimal point as the default.
 */
const formatCurrency = (value: number, locale = "en-GB"): string =>
  Intl.NumberFormat(locale, currencyFormatOptions).format(value);

const formatPercent = (
  value: number,
  fractionDigits = 2,
  locale = "en-GB"
): string =>
  Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);

const normalizedDateFormatOptions: Intl.DateTimeFormatOptions = {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "UTC",
};

/**
 * Formats a normalised date (i.e., time set to midnight UTC).
 *
 * If no locale is given, format representation is returned in short ISO format "YYYY-MM-DD".
 */
const formatNormalizedDate = (
  date: Date,
  locale?: string | undefined
): string =>
  locale
    ? Intl.DateTimeFormat(locale, normalizedDateFormatOptions).format(date)
    : date.toISOString().substring(0, 10);

export { formatCurrency, formatNormalizedDate, formatPercent };
