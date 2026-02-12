# loglayer

<p align="center">
  <a href="https://www.linkedin.com/in/akshaya-madhavan" title="LogLayer logo by Akshaya Madhavan"><img src="https://loglayer.dev/images/loglayer.png" alt="LogLayer logo by Akshaya Madhavan" width="200" /></a>
</p>

[![NPM version](https://img.shields.io/npm/v/loglayer.svg?style=flat-square)](https://www.npmjs.com/package/loglayer)
![NPM Downloads](https://img.shields.io/npm/dm/loglayer)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)
![npm package minimized gzipped size](https://img.shields.io/bundlejs/size/loglayer)

`loglayer` is a unified Typescript logger that routes logs to various logging libraries, cloud providers, files, and OpenTelemetry while providing a fluent API for specifying log messages, metadata and errors. 

Supports browser, Node.js, Bun, and Deno platforms.

- For full documentation, read the [docs](https://loglayer.dev).

```javascript
// Example using the Pino logging library with LogLayer
// You can also start out with a console logger and swap to another later!
import { LogLayer } from 'loglayer';
import { pino } from 'pino';
import { PinoTransport } from '@loglayer/transport-pino';
import { redactionPlugin } from '@loglayer/plugin-redaction';

const log = new LogLayer({
  // Multiple loggers can also be used at the same time. 
  transport: new PinoTransport({
    logger: pino()
  }),
  // Plugins modify log data before it's shipped to your logging library.
  plugins: [
    redactionPlugin({
      paths: ['password'],
      censor: '[REDACTED]',
    }),
  ],
  // Put context data in a specific field (default is flattened)
  contextFieldName: 'context',
  // Put metadata in a specific field (default is flattened)
  metadataFieldName: 'metadata',
})

// persisted data that is always included in logs
log.withContext({
  path: "/",
  reqId: "1234"
})

log.withPrefix("[my-app]")
  .withError(new Error('test'))
  // data that is included for this log entry only
  .withMetadata({ some: 'data', password: 'my-pass' })
  // Non-object data only (numbers, booleans, and strings only)
  // this can be omitted to just log an object / error
  // by using .errorOnly() / .metadataOnly() instead of withError() / withMetadata()
  .info('my message')
```

```json5
{
  "level": 30,
  "time": 1735857465669,
  "msg": "[my-app] my message",
  "context": {
    "path": "/",
    "reqId": "1234",
  },
  "metadata": {
    "password": "[REDACTED]",
    "some": "data",
  },
  "err":{
    "type": "Error",
    "message": "test",
    "stack": "Error: test\n ..."
  }
}
```

With the [Pretty Terminal Transport](https://loglayer.dev/transports/pretty-terminal):

![Pretty Terminal Transport](https://loglayer.dev/images/pretty-terminal/pretty-terminal-short-v2.gif)

The [Hot Shots Mixin](https://loglayer.dev/mixins/hot-shots) adds a metrics API to LogLayer:

```typescript
import { LogLayer, useLogLayerMixin, ConsoleTransport } from 'loglayer';
import { StatsD } from 'hot-shots';
import { hotshotsMixin } from '@loglayer/mixin-hot-shots';

// Create a StatsD client
const statsd = new StatsD({
  host: 'localhost',
  port: 8125
});

// Register the mixin (must be called before creating LogLayer instances)
useLogLayerMixin(hotshotsMixin(statsd));

// Create LogLayer instance
const log = new LogLayer({
  transport: new ConsoleTransport({
    logger: console
  })
});

// Use StatsD methods through the stats property
log.stats.increment('request.count').send();
log.info('Request received');
log.stats.timing('request.duration', 150).send();
log.info('Request processed');
log.stats.gauge('active.connections', 42).send();
log.info('Connection established');
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

- See the [LogLayer configuration documentation](https://loglayer.dev/configuration.html) for more configuration options.
- See the [Console Transport documentation](https://loglayer.dev/transports/console.html) for more configuration options.
