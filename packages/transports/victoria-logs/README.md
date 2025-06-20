# VictoriaLogs Transport for LogLayer

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Ftransport-victoria-logs)](https://www.npmjs.com/package/@loglayer/transport-victoria-logs)
[![NPM Downloads](https://img.shields.io/npm/dm/%40loglayer%2Ftransport-victoria-logs)](https://www.npmjs.com/package/@loglayer/transport-victoria-logs)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

A transport for [Victoria Metrics](https://victoriametrics.com/)' [VictoriaLogs](https://victoriametrics.com/products/victorialogs/) for the [LogLayer](https://loglayer.dev) logging library.

This transport is a wrapper around the [HTTP transport](https://loglayer.dev/transports/http) using the [VictoriaLogs JSON stream API](https://docs.victoriametrics.com/victorialogs/data-ingestion/#json-stream-api).

## Installation

```bash
npm install loglayer @loglayer/transport-victoria-logs serialize-error
```

## Usage

```typescript
import { LogLayer } from 'loglayer'
import { VictoriaLogsTransport } from "@loglayer/transport-victoria-logs"
import { serializeError } from "serialize-error";

const log = new LogLayer({
  errorSerializer: serializeError,
  transport: new VictoriaLogsTransport({
    url: "http://localhost:9428", // optional, defaults to http://localhost:9428
    // Configure stream-level fields for better performance
    streamFields: () => ({
      service: "my-app",
      environment: process.env.NODE_ENV || "development",
      instance: process.env.HOSTNAME || "unknown",
    }),
    // Custom timestamp function (optional)
    timestamp: () => new Date().toISOString(),
    // Custom HTTP parameters for VictoriaLogs ingestion
    httpParameters: {
      _time_field: "_time",
      _msg_field: "_msg",
    },
    // All other HttpTransport options are available and optional
    compression: false, // optional, defaults to false
    maxRetries: 3, // optional, defaults to 3
    retryDelay: 1000, // optional, defaults to 1000
    respectRateLimit: true, // optional, defaults to true
    enableBatchSend: true, // optional, defaults to true
    batchSize: 100, // optional, defaults to 100
    batchSendTimeout: 5000, // optional, defaults to 5000ms
    onError: (err) => {
      console.error('Failed to send logs to VictoriaLogs:', err);
    },
    onDebug: (entry) => {
      console.log('Log entry being sent to VictoriaLogs:', entry);
    },
  })
})

// Use the logger
log.info("This is a test message");
log.withMetadata({ userId: "123" }).error("User not found");
```

## Vibe code notice

99% of this code was vibe-coded using Cursor and in the agent `auto` mode with some supervision.

See the [Prompts](PROMPTS.md) file for the prompts used.

## Documentation

For more details, visit [https://loglayer.dev/transports/victoria-logs](https://loglayer.dev/transports/victoria-logs) 


## Related

- [LogLayer Documentation](https://loglayer.dev) - Main LogLayer documentation
- [HTTP Transport](/transports/http) - The underlying HTTP transport
- [VictoriaLogs Documentation](https://docs.victoriametrics.com/victorialogs/) - Official VictoriaLogs documentation
- [VictoriaLogs JSON Stream API](https://docs.victoriametrics.com/victorialogs/data-ingestion/#json-stream-api) - API documentation for the JSON stream endpoint
- [VictoriaLogs HTTP Parameters](https://docs.victoriametrics.com/victorialogs/data-ingestion/#http-parameters) - HTTP query parameters documentation
- [VictoriaLogs Stream Fields](https://docs.victoriametrics.com/victorialogs/keyconcepts/#stream-fields) - Stream fields documentation
