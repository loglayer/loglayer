# Datadog Browser Logs Transport for LogLayer

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Ftransport-datadog-browser-logs)](https://www.npmjs.com/package/@loglayer/transport-datadog-browser-logs)
[![NPM Downloads](https://img.shields.io/npm/dm/%40loglayer%2Ftransport-datadog-browser-logs)](https://www.npmjs.com/package/@loglayer/transport-datadog-browser-logs)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

The Datadog Browser Logs transport for [LogLayer](https://loglayer.dev).

[@datadog/browser-logs](https://docs.datadoghq.com/logs/log_collection/javascript/) is Datadog's official browser-side logging library.

## Important Notes

- Only works in browser environments (not in Node.js)
    * For server-side logging, use the `@loglayer/transport-datadog` package
- You will not get any console output since this sends directly to DataDog. 

## Installation

```bash
npm install loglayer @loglayer/transport-datadog-browser-logs @datadog/browser-logs
```

## Usage

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

const log = new LogLayer({
  transport: new DatadogBrowserLogsTransport({
    logger: datadogLogs
  })
})
```

## Documentation

For more details, visit [https://loglayer.dev/transports/datadog-browser-logs](https://loglayer.dev/transports/datadog)
