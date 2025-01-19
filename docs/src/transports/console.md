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

## Log Level Mapping

| LogLayer | Console   |
|----------|-----------|
| trace    | debug     |
| debug    | debug     |
| info     | info      |
| warn     | warn      |
| error    | error     |
| fatal    | error     |
