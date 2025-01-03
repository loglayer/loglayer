# Tracer Transport for LogLayer

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Ftransport-tracer)](https://www.npmjs.com/package/@loglayer/transport-tracer)
[![NPM Downloads](https://img.shields.io/npm/dm/%40loglayer%2Ftransport-tracer)](https://www.npmjs.com/package/@loglayer/transport-tracer)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

[tracer](https://www.npmjs.com/package/tracer) is a powerful and customizable logging library for node.js.

## Installation

```bash
npm install loglayer @loglayer/transport-tracer tracer
```

## Usage

```typescript
import { LogLayer } from 'loglayer'
import { TracerTransport } from '@loglayer/transport-tracer'
import tracer from 'tracer'

const logger = tracer.console()

const log = new LogLayer({
  transport: new TracerTransport({
    id: 'tracer',
    logger
  })
})
```

## Documentation

For more details, visit [https://loglayer.dev/transports/tracer](https://loglayer.dev/transports/tracer)
