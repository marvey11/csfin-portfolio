import { z } from "zod";

const CHECKSUM_STRING_REGEX = /^[A-Za-z0-9]{8}$/;
const ChecksumStringSchema = z
  .string()
  .regex(
    CHECKSUM_STRING_REGEX,
    "Invalid checksum format. Expected 8 hex characters."
  );

const DATE_STRING_REGEX = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
const DateStringSchema = z
  .string()
  .regex(DATE_STRING_REGEX, "Invalid date format. Expected YYYY-MM-DD.");

const ISIN_STRING_REGEX = /^[A-Z]{2}[A-Z0-9]{9}\d$/;
const IsinStringSchema = z
  .string()
  .regex(ISIN_STRING_REGEX, "Invalid ISIN format.");

const CurrencySchema = z
  .enum(["CAD", "DKK", "EUR", "USD"])
  .optional()
  .default("EUR");

const COUNTRY_CODE_REGEX = /^[A-Z]{2}$/;
const CountryCodeSchema = z.string().regex(COUNTRY_CODE_REGEX);

export {
  ChecksumStringSchema,
  CountryCodeSchema,
  CurrencySchema,
  DateStringSchema,
  IsinStringSchema,
};
