# LogTape Transport for LogLayer

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Ftransport-logtape)](https://www.npmjs.com/package/@loglayer/transport-logtape)
[![NPM Downloads](https://img.shields.io/npm/dm/%40loglayer%2Ftransport-logtape)](https://www.npmjs.com/package/@loglayer/transport-logtape)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

The LogTape transport for the [LogLayer](https://loglayer.dev) logging library.

[LogTape](https://logtape.org) is a modern, structured logging library for TypeScript and JavaScript with support for multiple sinks, filters, and adapters.

## Installation

```bash
npm install loglayer @loglayer/transport-logtape @logtape/logtape
```

## Usage

```typescript
import { configure, getConsoleSink, getLogger } from '@logtape/logtape'
import { LogLayer } from 'loglayer'
import { LogTapeTransport } from "@loglayer/transport-logtape"

// Configure LogTape
await configure({
  sinks: { console: getConsoleSink() },
  loggers: [
    { category: "my-app", lowestLevel: "debug", sinks: ["console"] }
  ]
})

// Get a LogTape logger instance
const logtapeLogger = getLogger(["my-app", "my-module"])

const log = new LogLayer({
  transport: new LogTapeTransport({
    logger: logtapeLogger
  })
})
```

## Documentation

For more details, visit [https://loglayer.dev/transports/logtape](https://loglayer.dev/transports/logtape)
