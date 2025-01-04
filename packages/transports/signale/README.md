# Signale Transport for LogLayer

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Ftransport-signale)](https://www.npmjs.com/package/@loglayer/transport-signale)
[![NPM Downloads](https://img.shields.io/npm/dm/%40loglayer%2Ftransport-signale)](https://www.npmjs.com/package/@loglayer/transport-signale)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

The Signale transport for [LogLayer](https://loglayer.dev).

[Signale](https://github.com/klaussinani/signale) is a highly configurable logging utility designed for CLI applications.

## Important Notes

- Signale only works in Node.js environments (not in browsers)
- It is primarily designed for CLI applications
- LogLayer only integrates with standard log levels (not CLI-specific levels like `success`, etc.)

## Installation

```bash
npm install loglayer @loglayer/transport-signale signale
```

## Usage

```typescript
import { Signale } from 'signale'
import { LogLayer } from 'loglayer'
import { SignaleTransport } from "@loglayer/transport-signale"

const signale = new Signale()

const log = new LogLayer({
  transport: new SignaleTransport({
    logger: signale
  })
})
```

## Documentation

For more details, visit [https://loglayer.dev/transports/signale](https://loglayer.dev/transports/signale)

