# Bunyan Transport for LogLayer

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Ftransport-bunyan)](https://www.npmjs.com/package/@loglayer/transport-bunyan)
[![NPM Downloads](https://img.shields.io/npm/dm/%40loglayer%2Ftransport-bunyan)](https://www.npmjs.com/package/@loglayer/transport-bunyan)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

The Bunyan transport for the [LogLayer](https://loglayer.dev) logging library.

[Bunyan](https://github.com/trentm/node-bunyan) is a JSON logging library for Node.js services.

## Installation

```bash
npm install loglayer @loglayer/transport-bunyan bunyan
```

## Usage

```typescript
import bunyan from 'bunyan'
import { LogLayer } from 'loglayer'
import { BunyanTransport } from "@loglayer/transport-bunyan"

const b = bunyan.createLogger({
  name: "my-logger",
  level: "trace",  // Show all log levels
  serializers: { 
    err: bunyan.stdSerializers.err  // Use Bunyan's error serializer
  }
})

const log = new LogLayer({
  errorFieldName: "err",  // Match Bunyan's error field name
  transport: new BunyanTransport({
    logger: b
  })
})
```

## Documentation

For more details, visit [https://loglayer.dev/transports/bunyan](https://loglayer.dev/transports/bunyan)

