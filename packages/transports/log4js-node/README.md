# Log4js Transport for LogLayer

[![NPM version](https://img.shields.io/npm/v/@loglayer/transport-log4js.svg?style=flat-square)](https://www.npmjs.com/package/@loglayer/transport-log4js)
![NPM Downloads](https://img.shields.io/npm/dm/@loglayer/transport-log4js)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

[Log4js-node](https://log4js-node.github.io/log4js-node/) is a conversion of the Log4j framework to Node.js.

## Important Notes

- Log4js only works in Node.js environments (not in browsers)
- By default, logging is disabled and must be configured via `level` or advanced configuration
- Consider using Winston as an alternative if Log4js configuration is too complex

## Installation

```bash
npm install loglayer @loglayer/transport-log4js log4js
```

## Usage

```typescript
import log4js from 'log4js'
import { LogLayer } from 'loglayer'
import { Log4JsTransport } from "@loglayer/transport-log4js"

const logger = log4js.getLogger()

// Enable logging output
logger.level = "trace"

const log = new LogLayer({
  transport: new Log4JsTransport({
    logger
  })
})
```

## Documentation

For more details, visit [https://loglayer.github.io/transports/log4js](https://loglayer.github.io/transports/log4js)
