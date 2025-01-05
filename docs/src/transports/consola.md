---
title: Consola Transport for LogLayer
description: Learn how to use the Consola logging library with LogLayer
---

# Consola Transport

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Ftransport-consola)](https://www.npmjs.com/package/@loglayer/transport-consola)

[Consola](https://github.com/unjs/consola) is an elegant and configurable console logger for Node.js and browser.

[Transport Source](https://github.com/loglayer/loglayer/tree/master/packages/transports/consola)

## Important Notes

- The default log level is `3` which excludes `debug` and `trace`
- Set level to `5` to enable all log levels
- Consola provides additional methods not available through LogLayer

## Installation

Install the required packages:

::: code-group

```sh [npm]
npm i loglayer @loglayer/transport-consola consola
```

```sh [pnpm]
pnpm add loglayer @loglayer/transport-consola consola
```

```sh [yarn]
yarn add loglayer @loglayer/transport-consola consola
```

:::

## Setup

```typescript
import { createConsola } from 'consola'
import { LogLayer } from 'loglayer'
import { ConsolaTransport } from "@loglayer/transport-consola"

const log = new LogLayer({
  transport: new ConsolaTransport({
    logger: createConsola({
      level: 5  // Enable all log levels
    })
  })
})
```

## Log Level Mapping

| LogLayer | Consola |
|----------|---------|
| trace    | trace   |
| debug    | debug   |
| info     | info    |
| warn     | warn    |
| error    | error   |
| fatal    | fatal   |
