# HTTP Transport for LogLayer

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Ftransport-http)](https://www.npmjs.com/package/@loglayer/transport-http)
[![NPM Downloads](https://img.shields.io/npm/dm/%40loglayer%2Ftransport-http)](https://www.npmjs.com/package/@loglayer/transport-http)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

An HTTP transport for the [LogLayer](https://loglayer.dev) logging library.

Ships logs to any HTTP endpoint with support for batching, compression, retries, and rate limiting. Features include:
- Configurable HTTP method and headers
- Custom payload template function
- Gzip compression support
- Retry logic with exponential backoff
- Rate limiting support
- Batch sending with configurable size and timeout
- Error and debug callbacks
- Log size validation and payload size tracking

## Installation

```bash
npm install loglayer @loglayer/transport-http serialize-error
```

## Usage

```typescript
import { LogLayer } from 'loglayer'
import { HttpTransport } from "@loglayer/transport-http"
import { serializeError } from "serialize-error";

const log = new LogLayer({
  errorSerializer: serializeError,
  transport: new HttpTransport({
    url: "https://api.example.com/logs",
    method: "POST", // optional, defaults to POST
    headers: {
      "Authorization": "Bearer YOUR_API_KEY",
      "Content-Type": "application/json"
    },
    // Or use a function for dynamic headers
    // headers: () => ({
    //   "Authorization": `Bearer ${getApiKey()}`,
    //   "Content-Type": "application/json"
    // }),
    contentType: "application/json", // optional, defaults to application/json
    batchContentType: "application/x-ndjson", // optional, defaults to application/json
    payloadTemplate: ({ logLevel, message, data }) => 
      JSON.stringify({
        timestamp: new Date().toISOString(),
        level: logLevel,
        message,
        metadata: data,
      }),
    compression: true, // optional, defaults to false
    maxRetries: 3, // optional, defaults to 3
    retryDelay: 1000, // optional, defaults to 1000
    respectRateLimit: true, // optional, defaults to true
    enableBatchSend: true, // optional, defaults to true
    batchSize: 100, // optional, defaults to 100
    batchSendTimeout: 5000, // optional, defaults to 5000ms
    batchSendDelimiter: "\n", // optional, defaults to "\n"
    maxLogSize: 1048576, // optional, defaults to 1MB
    maxPayloadSize: 5242880, // optional, defaults to 5MB
    enableNextJsEdgeCompat: false, // optional, defaults to false
    onError: (err) => {
      console.error('Failed to send logs:', err);
    },
    onDebug: (entry) => {
      console.log('Log entry being sent:', entry);
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

For more details, visit [https://loglayer.dev/transports/http](https://loglayer.dev/transports/http) 