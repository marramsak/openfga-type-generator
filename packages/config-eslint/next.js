const nextPlugin = require("@next/eslint-plugin-next");
const reactRefreshPlugin = require("eslint-plugin-react-refresh");
const reactHooksPlugin = require("eslint-plugin-react-hooks");
const reactPlugin = require("eslint-plugin-react");
const { fixupPluginRules } = require("@eslint/compat");
const base = require("./base");

/** @type {import("eslint").Linter.Config} */
module.exports = [
  ...base,
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      "react-refresh": reactRefreshPlugin,
      "react-hooks": fixupPluginRules(reactHooksPlugin),
      react: reactPlugin,
      "@next/next": nextPlugin,
    },
    rules: {
      ...reactPlugin.configs["jsx-runtime"].rules,
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
      // TypeError: context.getAncestors is not a function
      "@next/next/no-duplicate-head": "off",
      ...reactHooksPlugin.configs.recommended.rules,
      "@next/next/no-img-element": "error",
      "react-refresh/only-export-components": ["warn", { allowConstantExport: false }],
      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",
    },
    ignores: ["**/dist/*", "**/node_modules/*"],
    settings: {
      react: {
        version: "detect",
      },
    },
  },
];
