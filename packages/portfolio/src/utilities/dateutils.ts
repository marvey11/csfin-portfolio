const getDateObject = (date: string | Date): Date => {
  if (typeof date === "string") {
    if (isValidISODateString(date)) {
      return new Date(date);
    }
    throw new Error("Invalid date string provided");
  }

  return date;
};

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

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return false;
  }

  // All checks passed
  return true;
};

export { getDateObject, isValidISODateString };
