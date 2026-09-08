import nx from "@nx/eslint-plugin";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  // Global ignores: Ignore build output, configs, and package manifests
  {
    ignores: ["**/dist", "jest.config.cjs", "**/*.json"],
  },

  // Nx flat configs
  ...nx.configs["flat/base"],
  ...nx.configs["flat/typescript"],
  ...nx.configs["flat/javascript"],

  // Workspace rules for JS/TS
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    rules: {
      "@nx/enforce-module-boundaries": [
        "error",
        {
          enforceBuildableLibDependency: true,
          allow: ["^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$"],
          depConstraints: [
            {
              sourceTag: "*",
              onlyDependOnLibsWithTags: ["*"],
            },
          ],
        },
      ],
    },
  },

  // Prettier config must remain last
  eslintConfigPrettier,
];
