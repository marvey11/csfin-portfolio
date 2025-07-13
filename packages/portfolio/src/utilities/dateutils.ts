const getDateObject = (dateOrString: string | Date): Date => {
  if (typeof dateOrString === "string") {
    if (isValidISODateString(dateOrString)) {
      return new Date(dateOrString);
    } else if (isValidFormattedString(dateOrString)) {
      return createDateFromFormatted(dateOrString);
    }
    throw new Error(`Invalid date string provided: ${dateOrString}`);
  }

  return dateOrString;
};

/**
 * Checks whether or not a date string is in proper ISO format (YYYY-MM-DD) and whether the string represents a valid date.
 *
 * Checks for both syntax and semantics.
 *
 * @param dateString The string to verify.
 * @returns `true` if the string represents a valid ISO date string, else `false`.
 */
const isValidISODateString = (dateString: string): boolean => {
  // A -- check for correct format string
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return false;
  }

  // B -- check if we can instantiate a date object
  const date = new Date(dateString);

  // C -- check if the date conversion did not produce errors
  if (isNaN(date.getTime())) {
    return false;
  }

  // D -- check for semantically incorrect date strings, like e.g. "2025-06-31"
  const [year, month, day] = dateString.split("-").map(Number);
  if (!isMatchingDateObject(date, year, month, day)) {
    return false;
  }

  // All checks passed
  return true;
};

/**
 * Checks whether a formatted date string represents a locale-formatted date string.
 *
 * At the moment supports only locales that format dates in the short format as
 * "dd.mm.yyyy" (de-DE and similar) or "dd/mm/yyyy" (en-GB and similar).
 *
 * @param formattedDate The date string to be parsed.
 * @returns `true` if the string represents a valid formatted date string, else `false`.
 */
const isValidFormattedString = (formattedDate: string): boolean => {
  // A -- check whether the string follows the supported schemas
  if (
    !(
      /^\d{2}\.\d{2}\.\d{4}$/.test(formattedDate) ||
      /^\d{2}\/\d{2}\/\d{4}$/.test(formattedDate)
    )
  ) {
    return false;
  }

  // B -- parse the components and build a date
  const [day, month, year] = getCompsFromFormatted(formattedDate);
  const date = createDateFromComps(year, month, day);

  // C -- check for semantically incorrect date strings
  if (!isMatchingDateObject(date, year, month, day)) {
    return false;
  }

  // All checks passed
  return true;
};

const createDateFromFormatted = (formattedDate: string): Date => {
  const [day, month, year] = getCompsFromFormatted(formattedDate);
  return createDateFromComps(year, month, day);
};

const createDateFromComps = (year: number, month: number, day: number) =>
  new Date(Date.UTC(year, month - 1, day));

const getCompsFromFormatted = (formattedDate: string) =>
  formattedDate.split(/[\\.\\/]/).map(Number) as [number, number, number];

const isMatchingDateObject = (
  date: Date,
  year: number,
  month: number,
  day: number
): boolean =>
  date.getFullYear() === year &&
  date.getMonth() === month - 1 &&
  date.getDate() === day;

export { getDateObject, isValidFormattedString, isValidISODateString };
