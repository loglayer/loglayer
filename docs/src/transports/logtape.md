---
title: LogTape Transport for LogLayer
description: Send logs to LogTape with the LogLayer logging library
---

# LogTape Transport <Badge type="warning" text="Browser" /> <Badge type="tip" text="Server" />

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Ftransport-logtape)](https://www.npmjs.com/package/@loglayer/transport-logtape)

[LogTape](https://logtape.org) is a modern, structured logging library for TypeScript and JavaScript with support for multiple sinks, filters, and adapters.

[Transport Source](https://github.com/loglayer/loglayer/tree/master/packages/transports/logtape)

## Installation

Install the required packages:

::: code-group

```sh [npm]
npm i loglayer @loglayer/transport-logtape @logtape/logtape
```

```sh [pnpm]
pnpm add loglayer @loglayer/transport-logtape @logtape/logtape
```

```sh [yarn]
yarn add loglayer @loglayer/transport-logtape @logtape/logtape
```

:::

## Setup

```typescript
import { configure, getConsoleSink, getLogger } from '@logtape/logtape'
import { LogLayer } from 'loglayer'
import { LogTapeTransport } from "@loglayer/transport-logtape"

// Configure LogTape
await configure({
  sinks: { console: getConsoleSink() },
  loggers: [
    { category: "my-app", lowestLevel: "debug", sinks: ["console"] }
  ]
})

// Get a LogTape logger instance
const logtapeLogger = getLogger(["my-app", "my-module"])

const log = new LogLayer({
  transport: new LogTapeTransport({
    logger: logtapeLogger
  })
})
```

## Configuration Options

### Required Parameters

| Name | Type | Description |
|------|------|-------------|
| `logger` | `LogTapeLogger` | A configured LogTape logger instance |

### Optional Parameters

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `level` | `"trace" \| "debug" \| "info" \| "warn" \| "error" \| "fatal"` | `"trace"` | Minimum log level to process. Messages with a lower priority level will be ignored |
| `enabled` | `boolean` | `true` | If false, the transport will not send any logs to the logger |
| `consoleDebug` | `boolean` | `false` | If true, the transport will also log messages to the console for debugging |
| `id` | `string` | - | A unique identifier for the transport |

## Changelog

View the changelog [here](./changelogs/logtape-changelog.md).
