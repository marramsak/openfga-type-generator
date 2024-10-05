## Prerequisites

Ensure you have the following installed:

- visual studio code (https://code.visualstudio.com/download)
- node >= v20.13.1 (https://nodejs.org/en/download/package-manager)
- docker (https://docs.docker.com/desktop/)
- yarn (https://yarnpkg.com/getting-started/install)

## Environment setup

Install vs code recommended extensions

```sh
$ yarn install
$ docker compose up
```

## Starting the project

```sh
$ yarn dev
```

## Generating translations

```sh
$ cd apps/admin
$ yarn translate
```

## Building the project

```sh
$ yarn build
```
