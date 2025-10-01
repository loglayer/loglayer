---
title: Bunyan Transport for LogLayer
description: Send logs to Bunyan with the LogLayer logging library
---

# Bunyan Transport <Badge type="warning" text="Browser" /> <Badge type="tip" text="Server" />

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Ftransport-bunyan)](https://www.npmjs.com/package/@loglayer/transport-bunyan)

[Bunyan](https://github.com/trentm/node-bunyan) is a JSON logging library for Node.js services.

[Transport Source](https://github.com/loglayer/loglayer/tree/master/packages/transports/bunyan)

## Installation

Install the required packages:

::: code-group

```sh [npm]
npm i loglayer @loglayer/transport-bunyan bunyan
```

```sh [pnpm]
pnpm add loglayer @loglayer/transport-bunyan bunyan
```

```sh [yarn]
yarn add loglayer @loglayer/transport-bunyan bunyan
```

:::

## Setup

```typescript
import bunyan from 'bunyan'
import { LogLayer } from 'loglayer'
import { BunyanTransport } from "@loglayer/transport-bunyan"

const b = bunyan.createLogger({
  name: "my-logger",
  level: "trace",  // Show all log levels
  serializers: { 
    err: bunyan.stdSerializers.err  // Use Bunyan's error serializer
  }
})

const log = new LogLayer({
  errorFieldName: "err",  // Match Bunyan's error field name
  transport: new BunyanTransport({
    logger: b
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

| LogLayer | Bunyan  |
|----------|---------|
| trace    | trace   |
| debug    | debug   |
| info     | info    |
| warn     | warn    |
| error    | error   |
| fatal    | fatal   |

## Changelog

View the changelog [here](./changelogs/bunyan-changelog.md).

