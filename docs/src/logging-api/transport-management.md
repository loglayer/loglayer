---
title: Transport Management
description: How to manage transports in LogLayer
---

# Transport Management

## Replacing Transports

`withFreshTransports(transports: LogLayerTransport | Array<LogLayerTransport>): ILogLayer`

Replaces the existing transports with the provided transport(s). This can be useful for dynamically changing transports at runtime.
This only replaces the transports for the current logger instance, so if you are replacing transports for a child logger, it will not affect the parent logger
and vice versa.

```typescript
// Replace with a single transport
logger.withFreshTransports(new PinoTransport({ logger: pino() }))

// Replace with multiple transports
logger.withFreshTransports([
  new ConsoleTransport({ logger: console }),
  new PinoTransport({ logger: pino() })
])
```

::: warning Potential Performance Impact
Replacing transports at runtime may have a performance impact if you are frequently creating new transports.
It is recommended to re-use the same transport instance(s) where possible.
:::

## Obtaining the underlying logger instance

You can get the underlying logger for a transport if you've assigned an ID to it:

```typescript
const log = new LogLayer({
  transport: new ConsoleTransport({
    logger: console,
    id: 'console'
  })
})

const consoleLogger = log.getLoggerInstance<typeof console>('console')
```

```typescript
import { type P, pino } from "pino";
import { PinoTransport } from "@loglayer/transport-pino";

const log = new LogLayer({
  transport: new PinoTransport({
    logger: pino(),
    id: 'pino'
  })
})

const pinoLogger = log.getLoggerInstance<P.Pino>('pino')
```

::: info
Not all transports have a logger instance attached to them. In those cases, you will get
a null result.

You can identify if a transport can return such an instance if it takes in a `logger` parameter
in its constructor.
:::