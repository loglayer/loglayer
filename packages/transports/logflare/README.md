# Logflare Transport for LogLayer

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Ftransport-logflare)](https://www.npmjs.com/package/@loglayer/transport-logflare)
[![NPM Downloads](https://img.shields.io/npm/dm/%40loglayer%2Ftransport-logflare)](https://www.npmjs.com/package/@loglayer/transport-logflare)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

A Logflare transport for the [LogLayer](https://loglayer.dev) logging library.

Ships logs to [Logflare](https://logflare.app) using the HTTP transport with Logflare-specific configuration. Features include:
- Automatic Logflare JSON format
- Built on top of the robust HTTP transport
- Retry logic with exponential backoff
- Rate limiting support
- Batch sending with configurable size and timeout
- Error and debug callbacks
- Support for self-hosted Logflare instances

## Installation

```bash
npm install loglayer @loglayer/transport-logflare serialize-error
```

## Usage

```typescript
import { LogLayer } from 'loglayer'
import { LogflareTransport } from "@loglayer/transport-logflare"
import { serializeError } from "serialize-error";

const log = new LogLayer({
  errorSerializer: serializeError,
  contextFieldName: null, // recommended based on testing
  metadataFieldName: null, // recommended based on testing
  transport: new LogflareTransport({
    sourceId: "YOUR-SOURCE-ID",
    apiKey: "YOUR-API-KEY",

  })
})

// Use the logger
log.info("This is a test message");
log.withMetadata({ userId: "123" }).error("User not found");
```

## Documentation

For more details, visit [https://loglayer.dev/transports/logflare](https://loglayer.dev/transports/logflare)
