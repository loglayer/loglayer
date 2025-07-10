---
title: Console Transport for LogLayer
description: Send logs to the console with the LogLayer logging library
---

# Console Transport

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

### `level`

Sets the minimum log level to process. Messages with a lower priority level will be ignored.
- Type: `"trace" | "debug" | "info" | "warn" | "error" | "fatal"`
- Default: `"trace"` (processes all log levels)

Example with minimum level set to `"info"`:
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

### `appendObjectData`

Controls where object data (metadata, context, errors) appears in the log messages:
- `false` (default): Object data appears as the first parameter
- `true`: Object data appears as the last parameter

*Has no effect if `messageField` is defined.*

Example with `appendObjectData: false` (default):
```typescript
log.withMetadata({ user: 'john' }).info('User logged in');
// console.info({ user: 'john' }, 'User logged in')
```

Example with `appendObjectData: true`:
```typescript
log.withMetadata({ user: 'john' }).info('User logged in');
// console.info('User logged in', { user: 'john' })
```

### `messageField`

If defined, this option will:
- Place the message into the specified field in the log object
- Join multi-parameter messages with a space (use the sprintf plugin for formatted messages)
- Only log the object to the console

Example with `messageField: 'msg'`:
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

### `dateField`

If defined, populates the field with the ISO date. If `dateFn` is defined, will call `dateFn` to derive the date.
- Type: `string`
- Default: `undefined`

Example with `dateField: 'timestamp'`:
```typescript
const log = new LogLayer({
  transport: new ConsoleTransport({
    logger: console,
    dateField: 'timestamp'
  })
});

log.info('User logged in');
// console.info({ timestamp: '2023-12-01T10:30:00.000Z' })
```

### `levelField`

If defined, populates the field with the log level. If `levelFn` is defined, will call `levelFn` to derive the level.
- Type: `string`
- Default: `undefined`

Example with `levelField: 'level'`:
```typescript
const log = new LogLayer({
  transport: new ConsoleTransport({
    logger: console,
    levelField: 'level'
  })
});

log.warn('User session expired');
// console.warn({ level: 'warn' })
```

### `dateFn`

If defined, a function that returns a string or number for the value to be used for the `dateField`.
- Type: `() => string | number`
- Default: `undefined`

Example with custom date function:
```typescript
const log = new LogLayer({
  transport: new ConsoleTransport({
    logger: console,
    dateField: 'timestamp',
    dateFn: () => Date.now() // Returns Unix timestamp
  })
});

log.info('User logged in');
// console.info({ timestamp: 1701437400000 })
```

### `levelFn`

If defined, a function that returns a string or number for a given log level. The input should be the logLevel.
- Type: `(logLevel: LogLevelType) => string | number`
- Default: `undefined`

Example with custom level function:
```typescript
const log = new LogLayer({
  transport: new ConsoleTransport({
    logger: console,
    levelField: 'level',
    levelFn: (level) => level.toUpperCase()
  })
});

log.warn('User session expired');
// console.warn({ level: 'WARN' })
```

Example with numeric level mapping:
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
// console.error({ level: 50 })
```

## Combining Fields

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
