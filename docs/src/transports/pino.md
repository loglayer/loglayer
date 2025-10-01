---
title: Pino Transport for LogLayer
description: Send logs to Pino with the LogLayer logging library
---

# Pino Transport <Badge type="warning" text="Browser" /> <Badge type="tip" text="Server" />

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Ftransport-pino)](https://www.npmjs.com/package/@loglayer/transport-pino)

[Pino](https://github.com/pinojs/pino) is a very low overhead Node.js logger, focused on performance.

[Transport Source](https://github.com/loglayer/loglayer/tree/master/packages/transports/pino)

## Installation

Install the required packages:

::: code-group

```sh [npm]
npm i loglayer @loglayer/transport-pino pino
```

```sh [pnpm]
pnpm add loglayer @loglayer/transport-pino pino
```

```sh [yarn]
yarn add loglayer @loglayer/transport-pino pino
```

:::

## Setup

```typescript
import { pino } from 'pino'
import { LogLayer } from 'loglayer'
import { PinoTransport } from "@loglayer/transport-pino"

const p = pino({
  level: 'trace'  // Enable all log levels
})

const log = new LogLayer({
  transport: new PinoTransport({
    logger: p
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

| LogLayer | Pino    |
|----------|---------|
| trace    | trace   |
| debug    | debug   |
| info     | info    |
| warn     | warn    |
| error    | error   |
| fatal    | fatal   |

## Changelog

View the changelog [here](./changelogs/pino-changelog.md).