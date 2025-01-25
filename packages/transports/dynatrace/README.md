# Dynatrace Transport for LogLayer

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Ftransport-dynatrace)](https://www.npmjs.com/package/@loglayer/transport-dynatrace)
[![NPM Downloads](https://img.shields.io/npm/dm/%40loglayer%2Ftransport-dynatrace)](https://www.npmjs.com/package/@loglayer/transport-dynatrace)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

A transport for the [LogLayer](https://loglayer.dev) logging library to send logs to Dynatrace using their [Log Monitoring API v2](https://docs.dynatrace.com/docs/discover-dynatrace/references/dynatrace-api/environment-api/log-monitoring-v2/post-ingest-logs).

## Installation

```bash
npm install loglayer @loglayer/transport-dynatrace serialize-error
```

## Quick Start

You will need an access token with the `logs.ingest` scope. See [access token documentation](https://docs.dynatrace.com/docs/discover-dynatrace/references/dynatrace-api/basics/dynatrace-api-authentication) for more details.

```typescript
import { LogLayer } from 'loglayer'
import { DynatraceTransport } from "@loglayer/transport-dynatrace"

const log = new LogLayer({
  errorSerializer: serializeError,
  transport: new DynatraceTransport({
    url: "https://your-environment-id.live.dynatrace.com/api/v2/logs/ingest",
    ingestToken: "your-api-token",
    onError: (error) => console.error('Failed to send log:', error)
  })
})

log.info('Hello world')
```

## Documentation

For more details, visit [https://loglayer.dev/transports/dynatrace](https://loglayer.dev/transports/dynatrace)
