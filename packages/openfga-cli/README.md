# Openfga typescript type generator

OpenFGA Type Generator to generate TypeScript definitions based on an FGA (Fine-Grained Authorization) model.

## Prerequisites

- Node.js
- NPM (Node Package Manager) or yarn

Ensure both are installed on your machine before proceeding.

## Installation

To install all the dependencies, run:

```bash
npm install @cliclack/openfga-type-generator --save-dev
```

## Configuration

The generation command is defined in the package.json file:

```json
{
  "scripts": {
    "generate": "openfga-type-generator generate -s ./src/model.fga -d ./dist -n"
  }
}
```

- -s flag points to the source FGA model file (./src/model.fga).
- -d flag points to the destination directory (./dist).
- -n is used to to name types.

## Directory structure

```bash
├── src
│   └── model.fga      # The source FGA model
├── dist               # The directory where the generated types will be stored
└── package.json       # Project configuration and scripts

```

Example references of a model file named model.fga

```yaml
model
  schema 1.1

type organization
  relations
    define member: [user] or owner
    define owner: [user]
    define repo_admin: [user, organization#member]
    define repo_reader: [user, organization#member]
    define repo_writer: [user, organization#member]

type repo
  relations
    define admin: [user, team#member] or repo_admin from owner
    define maintainer: [user, team#member] or admin
    define owner: [organization]
    define reader: [user, team#member] or triager or repo_reader from owner
    define triager: [user, team#member] or writer
    define writer: [user, team#member] or maintainer or repo_writer from owner

type team
  relations
    define member: [user, team#member]

type user
```

## Usage

Generating Types from FGA Model
To generate TypeScript types from the FGA model located at ./src/model.fga, use the following command:

```bash
npm run generate
```

This will generate the types in the ./dist directory.

## License

This project is licensed under the MIT License.

## Authors

Marko Ramšak, Matija Ramšak, Biserka Zinreich
