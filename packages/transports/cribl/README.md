# Cribl Transport for LogLayer

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Ftransport-cribl)](https://www.npmjs.com/package/@loglayer/transport-cribl)
[![NPM Downloads](https://img.shields.io/npm/dm/%40loglayer%2Ftransport-cribl)](https://www.npmjs.com/package/@loglayer/transport-cribl)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

A Cribl transport for the [LogLayer](https://loglayer.dev) logging library.

Ships logs to [Cribl Stream](https://cribl.io) via the HTTP/S Bulk API source (`/cribl/_bulk`). Features include:
- Automatic Cribl HTTP Bulk API JSON format
- Built on top of the robust HTTP transport
- Retry logic with exponential backoff
- Rate limiting support
- Batch sending with configurable size and timeout
- Error and debug callbacks

## Installation

```bash
npm install loglayer @loglayer/transport-cribl serialize-error
```

## Usage

```typescript
import { LogLayer } from 'loglayer'
import { CriblTransport } from "@loglayer/transport-cribl"
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
