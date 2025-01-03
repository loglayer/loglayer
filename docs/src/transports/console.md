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
    logger: console
  })
})
```

## Features

- Works in both Node.js and browser environments
- No additional dependencies required
- Great for development and debugging
- Outputs to standard console methods (`console.log`, `console.error`, etc.)

## Log Level Mapping

| LogLayer | Console   |
|----------|-----------|
| trace    | debug     |
| debug    | debug     |
| info     | info      |
| warn     | warn      |
| error    | error     |
| fatal    | error     |
