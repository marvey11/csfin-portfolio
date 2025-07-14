const currencyFormatter = new Intl.NumberFormat("en-GB", {
  // Use "en-GB" locale to avoid the number formar from "de-DE" locale,
  // but still use the EUR for the currency.
  style: "currency",
  currency: "EUR",
});

export { currencyFormatter };
