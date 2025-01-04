# Winston Transport for LogLayer

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Ftransport-winston)](https://www.npmjs.com/package/@loglayer/transport-winston)
[![NPM Downloads](https://img.shields.io/npm/dm/%40loglayer%2Ftransport-winston)](https://www.npmjs.com/package/@loglayer/transport-winston)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

The Winston transport for [LogLayer](https://loglayer.dev).

[Winston](https://github.com/winstonjs/winston) is a multi-transport async logging library for Node.js.

## Installation

```bash
npm install loglayer @loglayer/transport-winston winston
```

## Usage

```typescript
import winston from 'winston'
import { LogLayer } from 'loglayer'
import { WinstonTransport } from "@loglayer/transport-winston"

const w = winston.createLogger({})

const log = new LogLayer({
  transport: new WinstonTransport({
    logger: w
  })
})
```

## Documentation

For more details, visit [https://loglayer.dev/transports/winston](https://loglayer.dev/transports/winston)

