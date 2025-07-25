/* eslint-disable */
import { readFileSync } from "fs";

// Reading the SWC compilation config for the spec files
const swcJestConfig = JSON.parse(
  readFileSync(`${__dirname}/.spec.swcrc`, "utf-8")
);

// Disable .swcrc look-up by SWC core because we're passing in swcJestConfig ourselves
swcJestConfig.swcrc = false;

export default {
  displayName: "@csfin-portfolio/shared",
  preset: "../../jest.preset.js",
  testEnvironment: "node",
  transform: {
    "^.+\\.[tj]s$": ["@swc/jest", swcJestConfig],
  },
  moduleFileExtensions: ["ts", "js", "html"],

  // --- ADD OR MODIFY THESE LINES FOR COVERAGE ---
  collectCoverage: true,
  coverageProvider: "v8",
  coverageReporters: ["lcov", "text", "clover"],
  coverageDirectory: "test-output/jest/coverage",
  // Optional: Set coverage thresholds to enforce minimum coverage percentages
  // If thresholds are not met, the test run will fail.
  coverageThreshold: {
    // You can set global thresholds or per-file thresholds
    global: {
      branches: 80, // Minimum branch coverage
      functions: 80, // Minimum function coverage
      lines: 80, // Minimum line coverage
      statements: 80, // Minimum statement coverage
    },
  },
  // --- END COVERAGE CONFIG ---
};
