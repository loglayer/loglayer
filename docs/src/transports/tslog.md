---
title: TsLog Transport for LogLayer
description: Send logs to TsLog with the LogLayer logging library
---

# tslog Transport <Badge type="warning" text="Browser" /> <Badge type="tip" text="Server" />

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Ftransport-tslog)](https://www.npmjs.com/package/@loglayer/transport-tslog)

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

log.info("Hello from tslog transport!")
```

```bash
2025-10-07 04:01:14.302 INFO    logger.ts:15    Hello from tslog transport!
```

::: info Callsite information
Because tslog is being used as part of LogLayer, LogLayer modifies the
tslog instance's private property `stackDepthLevel` to a value of `9` so
tslog can output the proper filename in the log output (as in the example above,
it shows `logger.ts:15` instead of something like `LogLayer.ts:123`).

This is also exposed as an optional configuration parameter in the transport
if you need to modify it.
:::

## Configuration Options

### Required Parameters

| Name | Type | Description |
|------|------|-------------|
| `logger` | `Logger<any>` | The tslog Logger instance to use for logging. |

### Optional Parameters

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `stackDepthLevel` | `number` | `9` | The stack depth level to use for logging. This is useful for getting accurate file and line number information in the logs. You may need to adjust this value based on how many layers of abstraction are between your logging calls and the transport. |

## Log Level Mapping

| LogLayer | tslog  |
|----------|--------|
| trace    | trace  |
| debug    | debug  |
| info     | info   |
| warn     | warn   |
| error    | error  |
| fatal    | fatal  |

## Changelog

View the changelog [here](./changelogs/tslog-changelog.md).