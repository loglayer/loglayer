---
title: Winston Transport for LogLayer
description: Learn how to use the Winston logging library with LogLayer
---

# Winston Transport

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Ftransport-winston)](https://www.npmjs.com/package/@loglayer/transport-winston)

[Winston](https://github.com/winstonjs/winston) A logger for just about everything.

[Transport Source](https://github.com/loglayer/loglayer/tree/master/packages/transports/winston)

## Installation

Install the required packages:

::: code-group

```sh [npm]
npm i loglayer @loglayer/transport-winston winston
```

```sh [pnpm]
pnpm add loglayer @loglayer/transport-winston winston
```

```sh [yarn]
yarn add loglayer @loglayer/transport-winston winston
```

:::

## Setup

```typescript
import winston from 'winston'
import { LogLayer } from 'loglayer'
import { WinstonTransport } from "@loglayer/transport-winston"

const w = winston.createLogger({})

const log = new LogLayer({
  transport: new WinstonTransport({
    logger: w
  })
})
```

## Log Level Mapping

| LogLayer | Winston |
|----------|---------|
| trace    | silly   |
| debug    | debug   |
| info     | info    |
| warn     | warn    |
| error    | error   |
| fatal    | error   |

## Changelog

View the changelog [here](./changelogs/winston-changelog.md).