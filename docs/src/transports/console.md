---
title: Console Transport for LogLayer
description: Learn how to use console logging with LogLayer
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

### `appendObjectData`

Controls where object data (metadata, context, errors) appears in the log messages:
- `false` (default): Object data appears as the first parameter
- `true`: Object data appears as the last parameter

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

## Log Level Mapping

| LogLayer | Console   |
|----------|-----------|
| trace    | debug     |
| debug    | debug     |
| info     | info      |
| warn     | warn      |
| error    | error     |
| fatal    | error     |
