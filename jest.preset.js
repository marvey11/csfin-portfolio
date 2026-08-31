const nxPreset = require("@nx/jest/preset").default;

module.exports = {
  ...nxPreset,
  transform: {
    "^.+\\.[tj]sx?$": [
      "@swc/jest",
      {
        jsc: {
          target: "es2022",
          parser: {
            syntax: "typescript",
            tsx: true,
            decorators: true,
            dynamicImport: true,
          },
          transform: {
            legacyDecorator: true,
            decoratorMetadata: true,
          },
        },
        module: {
          type: "commonjs",
        },
      },
    ],
  },
  collectCoverage: true,
  coverageProvider: "v8",
  coverageReporters: ["lcov", "text", "clover"],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
