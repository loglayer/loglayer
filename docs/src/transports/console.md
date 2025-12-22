---
title: Console Transport for LogLayer
description: Send logs to the console with the LogLayer logging library
---

# Console Transport <Badge type="warning" text="Browser" /> <Badge type="tip" text="Server" /> <Badge type="info" text="Deno" /> <Badge type="info" text="Bun" />

The simplest integration is with the built-in `console` object, which is available in both Node.js and browser environments.

[Transport Source](https://github.com/loglayer/loglayer/blob/master/packages/core/loglayer/src/transports/ConsoleTransport.ts)

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
import { LogLayer, ConsoleTransport } from 'loglayer'

const log = new LogLayer({
  transport: new ConsoleTransport({
    logger: console,
    // Optional: control where object data appears in log messages
    appendObjectData: false // default: false - object data appears first
  })
})
```

## Configuration Options

### Required Parameters

None - all parameters are optional.

### Optional Parameters

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `level` | `"trace" \| "debug" \| "info" \| "warn" \| "error" \| "fatal"` | `"trace"` | Sets the minimum log level to process. Messages with a lower priority level will be ignored |
| `appendObjectData` | `boolean` | `false` | Controls where object data (metadata, context, errors) appears in the log messages. `false`: Object data appears as the first parameter. `true`: Object data appears as the last parameter. Has no effect if `messageField` is defined |
| `messageField` | `string` | - | If defined, places the message into the specified field in the log object, joins multi-parameter messages with a space (use the sprintf plugin for formatted messages), and only logs the object to the console |
| `dateField` | `string` | - | If defined, populates the field with the ISO date and adds it as an additional parameter to the console call. If `dateFn` is defined, will call `dateFn` to derive the date |
| `levelField` | `string` | - | If defined, populates the field with the log level and adds it as an additional parameter to the console call. If `levelFn` is defined, will call `levelFn` to derive the level |
| `dateFn` | `() => string \| number` | - | If defined, a function that returns a string or number for the value to be used for the `dateField` |
| `levelFn` | `(logLevel: LogLevelType) => string \| number` | - | If defined, a function that returns a string or number for a given log level. The input should be the logLevel |
| `stringify` | `boolean` | `false` | If true, applies JSON.stringify to the structured log output when messageField, dateField, or levelField is defined |
| `messageFn` | `(params: LogLayerTransportParams) => string` | - | Custom function to format the log message output. Receives log level, messages, and data; returns the formatted string |

### Examples

#### Level Configuration
```typescript
const log = new LogLayer({
  transport: new ConsoleTransport({
    logger: console,
    level: "info"  // Will only process info, warn, error, and fatal logs
  })
});

log.debug('This message will be ignored');
log.info('This message will be logged');
```

#### Object Data Positioning
```typescript
// appendObjectData: false (default)
log.withMetadata({ user: 'john' }).info('User logged in');
// console.info({ user: 'john' }, 'User logged in')

// appendObjectData: true
log.withMetadata({ user: 'john' }).info('User logged in');
// console.info('User logged in', { user: 'john' })
```

#### Message Field
```typescript
const log = new LogLayer({
  transport: new ConsoleTransport({
    logger: console,
    messageField: 'msg'
  })
});

log.withMetadata({ user: 'john' }).info('User logged in', 'successfully');
// console.info({ user: 'john', msg: 'User logged in successfully' })
```

#### Date Field
```typescript
const log = new LogLayer({
  transport: new ConsoleTransport({
    logger: console,
    dateField: 'timestamp'
  })
});

log.info('User logged in');
// console.info('User logged in', { timestamp: '2023-12-01T10:30:00.000Z' })
```

#### Level Field
```typescript
const log = new LogLayer({
  transport: new ConsoleTransport({
    logger: console,
    levelField: 'level'
  })
});

log.warn('User session expired');
// console.warn('User session expired', { level: 'warn' })
```

#### Custom Date Function
```typescript
const log = new LogLayer({
  transport: new ConsoleTransport({
    logger: console,
    dateField: 'timestamp',
    dateFn: () => Date.now() // Returns Unix timestamp
  })
});

log.info('User logged in');
// console.info('User logged in', { timestamp: 1701437400000 })
```

#### Custom Level Function
```typescript
const log = new LogLayer({
  transport: new ConsoleTransport({
    logger: console,
    levelField: 'level',
    levelFn: (level) => level.toUpperCase()
  })
});

log.warn('User session expired');
// console.warn('User session expired', { level: 'WARN' })
```

#### Numeric Level Mapping
```typescript
const log = new LogLayer({
  transport: new ConsoleTransport({
    logger: console,
    levelField: 'level',
    levelFn: (level) => {
      const levels = { trace: 10, debug: 20, info: 30, warn: 40, error: 50, fatal: 60 };
      return levels[level as keyof typeof levels] || 0;
    }
  })
});

log.error('Database connection failed');
// console.error('Database connection failed', { level: 50 })
```

#### Stringify Output
```typescript
const log = new LogLayer({
  transport: new ConsoleTransport({
    logger: console,
    messageField: 'msg',
    dateField: 'timestamp',
    levelField: 'level',
    stringify: true
  })
});

log.withMetadata({ user: 'john' }).info('User logged in');
// console.info('{"user":"john","msg":"User logged in","timestamp":"2023-12-01T10:30:00.000Z","level":"info"}')
```

#### Custom Message Formatting
```typescript
import { LogLayer, ConsoleTransport } from 'loglayer';
import type { LogLayerTransportParams } from 'loglayer';

const log = new LogLayer({
  transport: new ConsoleTransport({
    logger: console,
    messageFn: ({ logLevel, messages }: LogLayerTransportParams) => {
      return `[${logLevel.toUpperCase()}] ${messages.join(' ')}`;
    }
  })
});

log.info('User logged in');
// console.info('[INFO] User logged in')

log.warn('Connection unstable');
// console.warn('[WARN] Connection unstable')
```

::: tip Prefix behavior
If you use `withPrefix()`, the prefix is applied to the messages before they reach `messageFn`. For example, `log.withPrefix('[MyApp]').info('Hello')` would pass `messages: ['[MyApp] Hello']` to your `messageFn`.
:::

## Structured Logging

You can combine multiple fields to create structured log objects:

```typescript
const log = new LogLayer({
  transport: new ConsoleTransport({
    logger: console,
    messageField: 'msg',
    dateField: 'timestamp',
    levelField: 'level'
  })
});

log.withMetadata({ user: 'john' }).info('User logged in');
// console.info({ 
//   user: 'john', 
//   msg: 'User logged in', 
//   timestamp: '2023-12-01T10:30:00.000Z', 
//   level: 'info' 
// })
```

## Log Level Mapping

| LogLayer | Console   |
|----------|-----------|
| trace    | debug     |
| debug    | debug     |
| info     | info      |
| warn     | warn      |
| error    | error     |
| fatal    | error     |
