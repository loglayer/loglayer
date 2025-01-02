# Consola Transport for LogLayer

![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Ftransport-consola)
![NPM Downloads](https://img.shields.io/npm/dm/%40loglayer%2Ftransport-consola)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

[Consola](https://github.com/unjs/consola) is an elegant and configurable console logger for Node.js and browser.

## Installation

```bash
npm install loglayer @loglayer/transport-consola consola
```

## Usage

```typescript
import { createConsola } from 'consola'
import { LogLayer } from 'loglayer'
import { ConsolaTransport } from "@loglayer/transport-consola"

const log = new LogLayer({
  transport: new ConsolaTransport({
    logger: createConsola({
      level: 5  // Enable all log levels
    })
  })
})
```

## Important Notes

- The default log level is `3` which excludes `debug` and `trace`
- Set level to `5` to enable all log levels

## Documentation

For more details, visit [https://loglayer.dev/transports/consola](https://loglayer.dev/transports/consola)
