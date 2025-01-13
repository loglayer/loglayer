---
title: Tracer Transport for LogLayer
description: Learn how to use the Tracer logging library with LogLayer
---

# Tracer Transport

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Ftransport-tracer)](https://www.npmjs.com/package/@loglayer/transport-tracer)

[Tracer](https://www.npmjs.com/package/tracer) is a powerful and customizable logging library for Node.js.

[Transport Source](https://github.com/loglayer/loglayer/tree/master/packages/transports/tracer)

## Installation

Install the required packages:

::: code-group

```sh [npm]
npm i loglayer @loglayer/transport-tracer tracer
```

```sh [pnpm]
pnpm add loglayer @loglayer/transport-tracer tracer
```

```sh [yarn]
yarn add loglayer @loglayer/transport-tracer tracer
```

:::

## Setup

```typescript
import { LogLayer } from 'loglayer'
import { TracerTransport } from '@loglayer/transport-tracer'
import tracer from 'tracer'

// Create a tracer logger instance
const logger = tracer.console()

const log = new LogLayer({
  transport: new TracerTransport({
    id: 'tracer',
    logger
  })
})
```

## Log Level Mapping

| LogLayer | Tracer  |
|----------|---------|
| trace    | trace   |
| debug    | debug   |
| info     | info    |
| warn     | warn    |
| error    | error   |
| fatal    | error   |

## Changelog

View the changelog [here](./changelogs/tracer-changelog.md).