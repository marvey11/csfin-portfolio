const getNumberFromFormatted = (formattedString: string): number => {
  return Number.parseFloat(formattedString.replaceAll(/\\,/g, ""));
};

export { getNumberFromFormatted };
