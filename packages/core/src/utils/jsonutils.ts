import { readFile } from "node:fs/promises";

const readJsonFile = async (path: string) =>
  readFile(path, "utf8").then(JSON.parse);

export { readJsonFile };
