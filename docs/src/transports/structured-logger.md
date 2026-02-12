---
title: Structured Transport for LogLayer
description: Console-based structured logging transport with JSON output enabled by default
---

# Structured Transport <Badge type="warning" text="Browser" /> <Badge type="tip" text="Server" /> <Badge type="info" text="Deno" /> <Badge type="info" text="Bun" />

A console-based transport with structured logging enabled by default. Unlike the [Console Transport](/transports/console), which requires manually configuring `messageField`, `levelField`, and `dateField`, the Structured Transport comes pre-configured with sensible defaults.

[Transport Source](https://github.com/loglayer/loglayer/blob/master/packages/core/loglayer/src/transports/StructuredTransport.ts)

## Installation

No additional packages needed beyond the core `loglayer` package:

::: code-group

```sh [npm]
npm i loglayer
```

```sh [pnpm]
pnpm add loglayer
```

```sh [yarn]
yarn add loglayer
```

:::

## Setup

```typescript
import { LogLayer, StructuredTransport } from 'loglayer'

const log = new LogLayer({
  transport: new StructuredTransport({
    logger: console,
  })
})

log.info('User logged in')
// console.info({ level: 'info', time: '2025-01-01T00:00:00.000Z', msg: 'User logged in' })
```

## Default Fields

The transport outputs structured log objects with the following default fields:

| Field | Default Key | Description |
|-------|-------------|-------------|
| Level | `level` | The log level (e.g., `info`, `warn`, `error`) |
| Timestamp | `time` | ISO 8601 date string |
| Message | `msg` | The log message (multi-parameter messages are joined with a space) |

Metadata and context data are merged into the log object alongside these fields.

## Configuration Options

### Required Parameters

None - all parameters are optional.

### Optional Parameters

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `level` | `"trace" \| "debug" \| "info" \| "warn" \| "error" \| "fatal"` | `"trace"` | Sets the minimum log level to process. Messages with a lower priority level will be ignored |
| `messageField` | `string` | `"msg"` | The field name for the log message. Multi-parameter messages will be joined with a space |
| `dateField` | `string` | `"time"` | The field name for the timestamp. If `dateFn` is defined, will call `dateFn` to derive the date |
| `levelField` | `string` | `"level"` | The field name for the log level. If `levelFn` is defined, will call `levelFn` to derive the level |
| `dateFn` | `() => string \| number` | - | If defined, a function that returns a string or number for the value to be used for the `dateField` |
| `levelFn` | `(logLevel: LogLevelType) => string \| number` | - | If defined, a function that returns a string or number for a given log level |
| `stringify` | `boolean` | `false` | If true, applies JSON.stringify to the structured log output |
| `messageFn` | `(params: LogLayerTransportParams) => string` | - | Custom function to format the log message output. Receives log level, messages, and data; returns the formatted string |

### Examples

#### With Metadata and Context

```typescript
const log = new LogLayer({
  transport: new StructuredTransport({
    logger: console,
  })
})

log.withContext({ service: 'api' })
log.withMetadata({ requestId: 'abc-123' }).info('Request received')
// console.info({
//   level: 'info',
//   time: '2025-01-01T00:00:00.000Z',
//   msg: 'Request received',
//   service: 'api',
//   requestId: 'abc-123'
// })
```

#### Custom Field Names

```typescript
const log = new LogLayer({
  transport: new StructuredTransport({
    logger: console,
    messageField: 'message',
    levelField: 'severity',
    dateField: 'timestamp'
  })
})

log.info('User logged in')
// console.info({ severity: 'info', timestamp: '2025-01-01T00:00:00.000Z', message: 'User logged in' })
```

#### Custom Date Function

```typescript
const log = new LogLayer({
  transport: new StructuredTransport({
    logger: console,
    dateFn: () => Date.now() // Unix timestamp instead of ISO string
  })
})

log.info('User logged in')
// console.info({ level: 'info', time: 1701437400000, msg: 'User logged in' })
```

#### Custom Level Function

```typescript
const log = new LogLayer({
  transport: new StructuredTransport({
    logger: console,
    levelFn: (level) => level.toUpperCase()
  })
})

log.warn('Disk space low')
// console.warn({ level: 'WARN', time: '2025-01-01T00:00:00.000Z', msg: 'Disk space low' })
```

#### JSON String Output

```typescript
const log = new LogLayer({
  transport: new StructuredTransport({
    logger: console,
    stringify: true
  })
})

log.withMetadata({ user: 'john' }).info('User logged in')
// console.info('{"level":"info","time":"2025-01-01T00:00:00.000Z","msg":"User logged in","user":"john"}')
```

#### Custom Message Formatting

```typescript
import { LogLayer, StructuredTransport } from 'loglayer'
import type { LogLayerTransportParams } from 'loglayer'

const log = new LogLayer({
  transport: new StructuredTransport({
    logger: console,
    messageFn: ({ logLevel, messages }: LogLayerTransportParams) => {
      return `[${logLevel.toUpperCase()}] ${messages.join(' ')}`
    }
  })
})

log.info('User logged in')
// console.info({ level: 'info', time: '...', msg: '[INFO] User logged in' })
```

::: tip Prefix behavior
If you use `withPrefix()`, the prefix is applied to the messages before they reach `messageFn`. For example, `log.withPrefix('[MyApp]').info('Hello')` would pass `messages: ['[MyApp] Hello']` to your `messageFn`.
:::

## Log Level Mapping

| LogLayer | Console   |
|----------|-----------|
| trace    | debug     |
| debug    | debug     |
| info     | info      |
| warn     | warn      |
| error    | error     |
| fatal    | error     |
