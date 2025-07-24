import Papa from "papaparse";

/**
 * A generic Papa Parse wrapper to simplify parsing with a given configuration.
 *
 * @template T The type of the parsed objects.
 * @param file The CSV file content as a string.
 * @param config The Papa Parse configuration object.
 * @returns The parsed data as an array of objects of type T.
 */
const parseWithConfig = <T>(file: string, config: Papa.ParseConfig<T>): T[] =>
  Papa.parse<T>(file, config).data;

export { parseWithConfig };
