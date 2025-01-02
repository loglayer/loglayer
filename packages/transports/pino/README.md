# Pino Transport for LogLayer

[![NPM version](https://img.shields.io/npm/v/%40loglayer%2Fpino-transport.svg?style=flat-square)](https://www.npmjs.com/package/@loglayer/pino-transport)
![NPM Downloads](https://img.shields.io/npm/dm/%40loglayer%2Fpino-transport)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

[Pino](https://github.com/pinojs/pino) is a very low overhead Node.js logger, focused on performance.

## Installation

```bash
npm install loglayer @loglayer/transport-pino pino
```

## Usage

```typescript
import pino, { P } from 'pino'
import { LogLayer } from 'loglayer'
import { PinoTransport } from "@loglayer/transport-pino"

const p = pino({
  level: 'trace'  // Enable all log levels
})

const log = new LogLayer<P.Logger>({
  transport: new PinoTransport({
    logger: p
  })
})
```

## Documentation

For more details, visit [https://loglayer.github.io/transports/pino](https://loglayer.github.io/transports/pino)
