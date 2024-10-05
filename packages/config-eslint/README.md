# Openfga typescript type generator

This custom ESLint package provides a tailored set of linting rules designed to ensure code consistency, best practices, and enforceable style guides across all JavaScript and TypeScript projects within the Cliclack ecosystem.

## Prerequisites

- Node.js
- NPM (Node Package Manager) or yarn

Ensure both are installed on your machine before proceeding.

## Installation

To install all the dependencies, run:

```bash
npm install @cliclack/@cliclack/config-eslint @eslint/compat @next/eslint-plugin-next @typescript-eslint/eslint-plugin @typescript-eslint/parser eslint eslint-config-next eslint-config-prettier eslint-config-react eslint-import-resolver-typescript eslint-plugin-import eslint-plugin-jsdoc eslint-plugin-prettier eslint-plugin-react eslint-plugin-react-hooks eslint-plugin-react-refresh eslint-plugin-simple-import-sort prettier typescript --save-dev
```

## Configuration

The lint command is defined in the package.json file:

```json
{
  "scripts": {
    "lint": "eslint --fix"
  }
}
```

Add the following code to the eslint.config.mjs file

```js
import base from "@cliclack/config-eslint/base";
export default [
  ...base,
  {
    ignores: ["node_modules/", "dist/"],
  },
];
```

## Directory structure

```bash
├── src
│   └── code.ts      # The source code file
└── package.json     # Project configuration and scripts
└── eslint.config.mjs     # Project configuration and scripts

```

## Usage

To lint the workspace run the following command

```bash
npm run lint
```

## License

This project is licensed under the MIT License.

## Authors

Marko Ramšak, Matija Ramšak, Biserka Zinreich
