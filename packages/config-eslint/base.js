const typescriptParser = require("@typescript-eslint/parser");
const typescriptPlugin = require("@typescript-eslint/eslint-plugin");
const core = require("./core");

/** @type {import("eslint").Linter.Config} */
module.exports = [
  ...core,
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      "@typescript-eslint": typescriptPlugin,
    },
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaFeatures: { modules: true },
        ecmaVersion: "latest",
        project: "./tsconfig.json",
      },
    },
    rules: {
      "@typescript-eslint/interface-name-prefix": 0,
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-member-accessibility": 0,
      "@typescript-eslint/no-parameter-properties": 0,
      "@typescript-eslint/no-non-null-assertion": 0,
      "@typescript-eslint/no-object-literal-type-assertion": 0,
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/ban-types": [
        "error",
        {
          types: {
            "{}": false,
          },
          extendDefaults: true,
        },
      ],
      "import/no-default-export": "off",
    },
    ignores: ["node_modules/", "dist/"],
    settings: {
      react: {
        version: "detect",
      },
    },
  },
];
