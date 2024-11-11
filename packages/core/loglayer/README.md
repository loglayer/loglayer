# loglayer

[![NPM version](https://img.shields.io/npm/v/loglayer.svg?style=flat-square)](https://www.npmjs.com/package/loglayer)
![NPM Downloads](https://img.shields.io/npm/dm/loglayer)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

`loglayer` standardizes log entry definitions, contextual data, metadata, and error reporting, 
streamlining your logging process using your logging library of choice like `pino` / `winston` / `bunyan` / etc.

For usage and supported logging libraries, see the loglayer [docs](https://loglayer.github.io).

For 4.x documentation, see the [4.x branch](https://github.com/loglayer/loglayer/tree/4.x).

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
