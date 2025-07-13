/**
 * Parses a number string by first attempting to detect its locale (English or German).
 *
 * @param numberString The number string to parse.
 * @returns The parsed number, or NaN if parsing fails.
 */
const parseNumberWithAutoLocale = (numberString: string): number =>
  parseLocaleNumber(numberString, detectNumberLocale(numberString));

/**
 * Parses a locale-formatted number string into a standard JavaScript number.
 * Assumes the string strictly follows the number formatting rules of the specified locale.
 *
 * (Provided by Gemini, with minor modifications)
 *
 * @param numberString The number string to parse (e.g., "1.234,56" for 'de-DE', "1,234.56" for 'en-GB').
 * @param locale The locale string (e.g., 'en-GB', 'de-DE').
 * @returns The parsed number, or `NaN` if parsing fails.
 */
const parseLocaleNumber = (numberString: string, locale: string): number => {
  // 1. Get a formatter for the target locale to inspect its separators
  const formatter = new Intl.NumberFormat(locale);
  const parts = formatter.formatToParts(12345.67); // Use a reference number to get parts

  let decimalSeparator = "."; // Default to standard dot
  let thousandsSeparator = ""; // Default to no thousands separator

  for (const part of parts) {
    if (part.type === "decimal") {
      decimalSeparator = part.value;
    } else if (part.type === "group") {
      // 'group' refers to thousands separator
      thousandsSeparator = part.value;
    }
  }

  // 2. Remove thousands separators
  // Escape the thousandsSeparator for regex if it's a special character (e.g., '.')
  const escapedThousandsSeparator = thousandsSeparator.replace(
    /[.*+?^${}()|[\]\\]/g,
    "\\$&"
  );
  const cleanedString = numberString.replace(
    new RegExp(escapedThousandsSeparator, "g"),
    ""
  );

  // 3. Replace the decimal separator with a standard dot
  const finalString = cleanedString.replace(decimalSeparator, ".");

  // 4. Parse the cleaned string
  return Number(finalString);
};

/**
 * Attempts to detect the most likely locale (English or German) for a given
 * number string based on the usage of comma and dot as separators.
 * This is a heuristic and may not be 100% accurate for all number formats or locales.
 *
 * (Provided by Gemini, with minor modifications)
 *
 * @param numberString The number string to analyze.
 * @returns 'en-GB' for English-like, 'de-DE' for German-like, or a default if ambiguous.
 */
function detectNumberLocale(numberString: string): "en-GB" | "de-DE" {
  const hasComma = numberString.includes(",");
  const hasDot = numberString.includes(".");

  if (!hasComma && !hasDot) {
    // No separators: e.g., "123". Ambiguous, default to English.
    return "en-GB";
  }

  if (hasComma && !hasDot) {
    // Only comma: e.g., "123,45" (German decimal) or "1,234" (English thousands).
    // If it's a thousands separator, it's usually followed by more numbers,
    // but if it's the *only* separator, it's very likely a German decimal.
    // We'll lean towards German here for precision.
    return "de-DE";
  }

  if (!hasComma && hasDot) {
    // Only dot: e.g., "123.45" (English decimal) or "1.234" (German thousands).
    // Similar to above, if it's the *only* separator, it's very likely English decimal.
    return "en-GB";
  }

  // Both comma and dot exist. This is where the primary distinction lies.
  const lastCommaIndex = numberString.lastIndexOf(",");
  const lastDotIndex = numberString.lastIndexOf(".");

  if (lastCommaIndex > lastDotIndex) {
    // Example: "1.234,56" - comma is the last separator -> German decimal
    return "de-DE";
  } else {
    // Example: "1,234.56" - dot is the last separator -> English decimal
    return "en-GB";
  }
}

export { parseLocaleNumber, parseNumberWithAutoLocale };
