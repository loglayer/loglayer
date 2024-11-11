# Bunyan Transport for LogLayer

[![NPM version](https://img.shields.io/npm/v/@loglayer/transport-bunyan.svg?style=flat-square)](https://www.npmjs.com/package/@loglayer/transport-bunyan)
![NPM Downloads](https://img.shields.io/npm/dm/@loglayer/transport-bunyan)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

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

For more details, visit [https://loglayer.github.io/transports/bunyan](https://loglayer.github.io/transports/bunyan)

