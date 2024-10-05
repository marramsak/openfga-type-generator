const prettierPlugin = require("eslint-plugin-prettier");
const simpleSortPlugin = require("eslint-plugin-simple-import-sort");

/** @type {import("eslint").Linter.Config} */
module.exports = [
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.mjs", "**/*.jsx"],
    plugins: {
      "simple-import-sort": simpleSortPlugin,
      prettier: prettierPlugin,
    },
    languageOptions: {
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      ...prettierPlugin.configs.recommended.rules,
      "simple-import-sort/imports": [
        "error",
        {
          groups: [["^react", "^\\u0000", "^@?\\w", "^[^.]", "^\\."]],
        },
      ],
      "import/no-named-as-default-member": "off",
      "import/no-named-as-default": "off",
      "no-return-await": "error",
      "require-await": "error",
      "prettier/prettier": [
        "error",
        {
          singleQuote: false,
        },
      ],
      "prettier/prettier": [
        "error",
        {
          endOfLine: "lf",
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
