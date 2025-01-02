# loglayer

[![NPM version](https://img.shields.io/npm/v/loglayer.svg?style=flat-square)](https://www.npmjs.com/package/loglayer)
![NPM Downloads](https://img.shields.io/npm/dm/loglayer)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

`loglayer` is a layer on top of logging libraries like `pino` / `winston` / `bunyan` to
provide a consistent logging experience across all your projects.

For usage and supported logging libraries, see the loglayer [docs](https://loglayer.dev).

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
