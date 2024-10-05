import base from "@cliclack/config-eslint/base";
export default [
  ...base,
  {
    ignores: ["node_modules/", "dist/"],
  },
];
