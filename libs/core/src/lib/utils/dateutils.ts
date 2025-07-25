const normalizeDate = (date: Date): Date => {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      0,
      0,
      0,
      0
    )
  );
};

const compareNormalizedDates = (date1: Date, date2: Date): number => {
  const norm1 = normalizeDate(date1).getTime();
  const norm2 = normalizeDate(date2).getTime();

  if (norm1 < norm2) {
    return -1;
  }
  if (norm1 > norm2) {
    return 1;
  }
  return 0;
};

const getDateObject = (dateOrString: string | Date): Date => {
  let date: Date;

  if (typeof dateOrString === "string") {
    if (isValidISODateString(dateOrString)) {
      date = new Date(dateOrString);
    } else if (isValidFormattedString(dateOrString)) {
      date = createDateFromFormatted(dateOrString);
    } else {
      throw new Error(`Invalid date string provided: ${dateOrString}`);
    }
  } else {
    date = dateOrString;
  }

  return normalizeDate(date);
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

  return isValidDateComponents(year, month, day);
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

  // B -- parse the components and check them
  const [day, month, year] = getCompsFromFormatted(formattedDate);

  return isValidDateComponents(year, month, day);
};

const createDateFromFormatted = (formattedDate: string): Date => {
  const [day, month, year] = getCompsFromFormatted(formattedDate);
  return createDateFromComps(year, month, day);
};

const createDateFromComps = (year: number, month: number, day: number) =>
  new Date(Date.UTC(year, month - 1, day));

const getCompsFromFormatted = (formattedDate: string) =>
  formattedDate.split(/[\\.\\/]/).map(Number) as [number, number, number];

/**
 * Checks whether the provided date components year, month, and day are valid.
 *
 * This function is used to catch semantically incorrect dates.
 *
 * For example, the incorrect date 31/06/2025 will likely be converted to 01/07/2025 on Date
 * instantiation. In that case the day/month/year components will not be matching the actual date
 * object.
 */
const isValidDateComponents = (
  year: number | undefined,
  month: number | undefined,
  day: number | undefined
): boolean => {
  if (year === undefined || month === undefined || day === undefined) {
    return false;
  }

  const date = createDateFromComps(year, month, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

export {
  compareNormalizedDates,
  getDateObject,
  isValidDateComponents,
  isValidFormattedString,
  isValidISODateString,
  normalizeDate,
};
