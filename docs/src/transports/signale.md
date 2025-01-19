---
title: Signale Transport for LogLayer
description: Send logs to Signale with the LogLayer logging library
---

# Signale Transport

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Ftransport-signale)](https://www.npmjs.com/package/@loglayer/transport-signale)

[Signale](https://github.com/klaussinani/signale) is a highly configurable logging utility designed for CLI applications.

[Transport Source](https://github.com/loglayer/loglayer/tree/master/packages/transports/signale)

## Important Notes

- Signale only works in Node.js environments (not in browsers)
- It is primarily designed for CLI applications
- LogLayer only integrates with standard log levels (not CLI-specific levels like `success`, `await`, etc.)

## Installation

Install the required packages:

::: code-group

```sh [npm]
npm i loglayer @loglayer/transport-signale signale
```

```sh [pnpm]
pnpm add loglayer @loglayer/transport-signale signale
```

```sh [yarn]
yarn add loglayer @loglayer/transport-signale signale
```

:::

## Setup

```typescript
import { Signale } from 'signale'
import { LogLayer } from 'loglayer'
import { SignaleTransport } from "@loglayer/transport-signale"

const signale = new Signale()

const log = new LogLayer({
  transport: new SignaleTransport({
    logger: signale
  })
})
```

## Log Level Mapping

| LogLayer | Signale |
|----------|---------|
| trace    | debug   |
| debug    | debug   |
| info     | info    |
| warn     | warn    |
| error    | error   |
| fatal    | error   |

## Changelog

View the changelog [here](./changelogs/signale-changelog.md).