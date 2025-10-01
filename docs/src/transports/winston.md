---
title: Winston Transport for LogLayer
description: Send logs to Winston with the LogLayer logging library
---

# Winston Transport <Badge type="warning" text="Browser" /> <Badge type="tip" text="Server" />

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

## Configuration Options

### Required Parameters

None - all parameters are optional.

### Optional Parameters

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `level` | `"trace" \| "debug" \| "info" \| "warn" \| "error" \| "fatal"` | `"trace"` | Minimum log level to process. Messages with a lower priority level will be ignored |
| `enabled` | `boolean` | `true` | If false, the transport will not send any logs to the logger |
| `consoleDebug` | `boolean` | `false` | If true, the transport will also log messages to the console for debugging |
| `id` | `string` | - | A unique identifier for the transport |

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