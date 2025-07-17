import * as path from "node:path";

const resolvePath = (inputPath: string): string => {
  if (!inputPath || typeof inputPath !== "string") {
    return inputPath;
  }

  if (inputPath.startsWith("~")) {
    const homeDir = process.env.HOME || process.env.USERPROFILE;

    if (!homeDir) {
      console.warn(
        "Warning: Could not determine user home directory. Tilde path not expanded."
      );
      return inputPath;
    }

    if (inputPath === "~") {
      return homeDir;
    }

    if (inputPath.startsWith("~/")) {
      return path.join(homeDir, inputPath.substring(2));
    }

    console.warn(
      `Warning: Path "${inputPath}" starts with "~" but is not "~" or "~/", not attempting expansion.`
    );
  }

  return inputPath;
};

export { resolvePath };
