import { Security } from "../security";

type SecurityJSON = Security;

const isSecurityJSON = (data: unknown): data is SecurityJSON => {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const potential = data as { [key: string]: unknown };

  return (
    "isin" in potential &&
    typeof potential.isin === "string" &&
    "nsin" in potential &&
    typeof potential.nsin === "string" &&
    "name" in potential &&
    typeof potential.name === "string"
  );
};

type SecurityRepositoryJSON = Security[];

const isSecurityRepositoryJSON = (
  data: unknown
): data is SecurityRepositoryJSON =>
  Array.isArray(data) && data.every(isSecurityJSON);

export { isSecurityJSON, isSecurityRepositoryJSON };
export type { SecurityJSON, SecurityRepositoryJSON };
