# Winston Transport for LogLayer

[![NPM version](https://img.shields.io/npm/v/@loglayer/transport-winston.svg?style=flat-square)](https://www.npmjs.com/package/@loglayer/transport-winston)
![NPM Downloads](https://img.shields.io/npm/dm/@loglayer/transport-winston)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

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

For more details, visit [https://loglayer.github.io/transports/winston](https://loglayer.github.io/transports/winston)

