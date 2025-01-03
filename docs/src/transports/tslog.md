---
title: TsLog Transport for LogLayer
description: Learn how to use the TsLog logging library with LogLayer
---

# TsLog Transport

[tslog](https://tslog.js.org/) is a powerful TypeScript logging library that provides beautiful logging with full TypeScript support.

[Transport Source](https://github.com/loglayer/loglayer/tree/master/packages/transports/tslog)

## Installation

Install the required packages:

::: code-group

```sh [npm]
npm i loglayer @loglayer/transport-tslog tslog
```

```sh [pnpm]
pnpm add loglayer @loglayer/transport-tslog tslog
```

```sh [yarn]
yarn add loglayer @loglayer/transport-tslog tslog
```

:::

## Setup

```typescript
import { Logger } from "tslog"
import { LogLayer } from 'loglayer'
import { TsLogTransport } from "@loglayer/transport-tslog"

const tslog = new Logger()

const log = new LogLayer({
  transport: new TsLogTransport({
    logger: tslog
  })
})
```

## Log Level Mapping

| LogLayer | tslog  |
|----------|--------|
| trace    | trace  |
| debug    | debug  |
| info     | info   |
| warn     | warn   |
| error    | error  |
| fatal    | fatal  |
