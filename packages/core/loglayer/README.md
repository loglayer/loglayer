# loglayer

[![NPM version](https://img.shields.io/npm/v/loglayer.svg?style=flat-square)](https://www.npmjs.com/package/loglayer)
![NPM Downloads](https://img.shields.io/npm/dm/loglayer)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

`loglayer` is a layer on top of logging libraries like `pino` / `winston` / `bunyan` to
provide a consistent logging experience across all your projects.

- For full documentation, read the [docs](https://loglayer.dev).
- [Older 4.x documentation](https://github.com/loglayer/loglayer/tree/4.x)

```javascript
// Example using the Pino logging library with LogLayer
import { LogLayer } from 'loglayer';
import { pino } from 'pino';
import { PinoTransport } from '@loglayer/transport-pino';
import { redactionPlugin } from '@loglayer/plugin-redaction';

const log = new LogLayer({
  // Multiple loggers can also be used at the same time. 
  // Need to also ship to a cloud provider like DataDog at the same time? You can!
  transport: new PinoTransport({
    logger: pino()
  }),
  // Plugins can be created to modify log data before it's shipped to your logging library.
  plugins: [
    redactionPlugin({
      paths: ['password'],
      censor: '[REDACTED]',
    }),
  ],
})

log.withPrefix("[my-app]")
  .withMetadata({ some: 'data', password: 'my-pass' })
  .withError(new Error('test'))
  .info('my message')
```

```json5
{
  "level":30,
  "time":1735857465669,
  "pid":30863,
  "msg":"[my-app] my message",
  // The placement of these fields are also configurable!
  "password":"[REDACTED]",
  "some":"data",
  "err":{
    "type":"Error",
    "message":"test",
    "stack":"Error: test\n ..."
  }
}
```

## Installation

Install the core package:

```bash
npm i loglayer
```

## Quick Start

```typescript
import { LogLayer, ConsoleTransport } from 'loglayer'

const log = new LogLayer({
  transport: new ConsoleTransport({
    logger: console,
  }),
})

log
  .withMetadata({ some: 'data'})
  .withError(new Error('test'))
  .info('my message')
```
