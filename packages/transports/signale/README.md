# Signale Transport for LogLayer

[![NPM version](https://img.shields.io/npm/v/@loglayer/transport-signale.svg?style=flat-square)](https://www.npmjs.com/package/@loglayer/transport-signale)
![NPM Downloads](https://img.shields.io/npm/dm/@loglayer/transport-signale)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

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

For more details, visit [https://loglayer.github.io/transports/signale](https://loglayer.github.io/transports/signale)

