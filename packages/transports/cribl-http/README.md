# Cribl HTTP/S Transport for LogLayer

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Ftransport-cribl-http)](https://www.npmjs.com/package/@loglayer/transport-cribl-http)
[![NPM Downloads](https://img.shields.io/npm/dm/%40loglayer%2Ftransport-cribl-http)](https://www.npmjs.com/package/@loglayer/transport-cribl-http)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

A Cribl HTTP/S transport for the [LogLayer](https://loglayer.dev) logging library.

Ships logs to [Cribl Stream](https://cribl.io) via the [HTTP/S Bulk API source](https://docs.cribl.io/stream/sources-https/) (`/cribl/_bulk`). Features include:
- Automatic Cribl HTTP/S Bulk API JSON format
- Built on top of the robust HTTP transport
- Retry logic with exponential backoff
- Rate limiting support
- Batch sending with configurable size and timeout
- Error and debug callbacks

## Installation

```bash
npm install loglayer @loglayer/transport-cribl-http serialize-error
```

## Usage

```typescript
import { LogLayer } from 'loglayer'
import { CriblTransport } from "@loglayer/transport-cribl-http"
import { serializeError } from "serialize-error";

const log = new LogLayer({
  errorSerializer: serializeError,
  transport: new CriblTransport({
    url: "https://your-cribl-instance:10080",
    token: "YOUR-AUTH-TOKEN",
    source: "my-app",
    host: "server-01",
  })
})

// Use the logger
log.info("This is a test message");
log.withMetadata({ userId: "123" }).error("User not found");
```

## Documentation

For more details, visit [https://loglayer.dev/transports/cribl](https://loglayer.dev/transports/cribl)
