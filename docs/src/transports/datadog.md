# Datadog Browser Logs Transport

[@datadog/browser-logs](https://docs.datadoghq.com/logs/log_collection/javascript/) is Datadog's official browser-side logging library.

## Important Notes

- Only works in browser environments (not in Node.js)
- Requires a Datadog account and client token
- Automatically forwards errors to Datadog
- Supports global context and custom attributes

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
