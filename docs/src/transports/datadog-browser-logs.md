---
title: DataDog Browser Logs Transport for LogLayer
description: Learn how to use the DataDog Browser Logs library with LogLayer
---

# DataDog Browser Logs Transport

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Ftransport-datadog-browser-logs)](https://www.npmjs.com/package/@loglayer/transport-datadog-browser-logs)

[@datadog/browser-logs](https://docs.datadoghq.com/logs/log_collection/javascript/) is Datadog's official browser-side logging library.

[Transport Source](https://github.com/loglayer/loglayer/tree/master/packages/transports/datadog-browser-logs)

## Important Notes

- Only works in browser environments (not in Node.js)
  * For server-side logging, use the [`@loglayer/transport-datadog`](/transports/datadog.html) package
- You will not get any console output since this sends directly to DataDog. Use the `onDebug` option to log out messages.

## Installation

Install the required packages:

::: code-group

```sh [npm]
npm i loglayer @loglayer/transport-datadog-browser-logs @datadog/browser-logs
```

```sh [pnpm]
pnpm add loglayer @loglayer/transport-datadog-browser-logs @datadog/browser-logs
```

```sh [yarn]
yarn add loglayer @loglayer/transport-datadog-browser-logs @datadog/browser-logs
```

:::

## Setup

```typescript
import { datadogLogs } from '@datadog/browser-logs'
import { LogLayer } from 'loglayer'
import { DatadogBrowserLogsTransport } from "@loglayer/transport-datadog-browser-logs"

// Initialize Datadog
datadogLogs.init({
  clientToken: '<CLIENT_TOKEN>',
  site: '<DATADOG_SITE>',
  forwardErrorsToLogs: true,
  sampleRate: 100
})

// Basic setup
const log = new LogLayer({
  transport: new DatadogBrowserLogsTransport({
    id: "datadog",
    logger: datadogLogs
  })
})

// Or with a custom logger instance
const logger = datadogLogs.createLogger('my-logger')
const log = new LogLayer({
  transport: new DatadogBrowserLogsTransport({
    id: "datadog",
    logger
  })
})
```

## Log Level Mapping

| LogLayer | Datadog |
|----------|---------|
| trace    | debug   |
| debug    | debug   |
| info     | info    |
| warn     | warn    |
| error    | error   |
| fatal    | error   |
