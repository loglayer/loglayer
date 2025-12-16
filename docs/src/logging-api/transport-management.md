---
title: Transport Management
description: How to manage transports in LogLayer
---

# Transport Management

LogLayer provides methods to dynamically add, remove, and replace transports at runtime.

::: tip Parent-Child Isolation
Transport changes only affect the current logger instance. Child loggers created before the change will retain their original transports, and parent loggers are not affected when a child modifies its transports.
:::

## Adding Transports

`addTransport(transports: LogLayerTransport | Array<LogLayerTransport>): ILogLayer`

Adds one or more transports to the existing transports. If a transport with the same ID already exists, it will be replaced and its `[Symbol.dispose]()` method will be called if implemented.

```typescript
// Add a single transport
logger.addTransport(new PinoTransport({
  logger: pino(),
  id: 'pino'
}))

// Add multiple transports at once
logger.addTransport([
  new ConsoleTransport({ logger: console, id: 'console' }),
  new PinoTransport({ logger: pino(), id: 'pino' })
])

// Replace an existing transport by using the same ID
logger.addTransport(new PinoTransport({
  logger: pino({ level: 'debug' }),
  id: 'pino'  // This will replace the existing 'pino' transport
}))
```

## Removing Transports

`removeTransport(id: string): boolean`

Removes a transport by its ID. Returns `true` if the transport was found and removed, `false` otherwise.

If the transport implements the [Disposable](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-2.html#using-declarations-and-explicit-resource-management) interface, its `[Symbol.dispose]()` method will be called automatically when removed.

```typescript
const log = new LogLayer({
  transport: [
    new ConsoleTransport({ logger: console, id: 'console' }),
    new PinoTransport({ logger: pino(), id: 'pino' })
  ]
})

// Remove a specific transport
const wasRemoved = log.removeTransport('console')  // true

// Trying to remove a non-existent transport returns false
const notFound = log.removeTransport('nonexistent')  // false
```

## Replacing All Transports

`withFreshTransports(transports: LogLayerTransport | Array<LogLayerTransport>): ILogLayer`

Replaces all existing transports with the provided transport(s). This is useful when you want to completely change the logging destinations. All existing transports will have their `[Symbol.dispose]()` method called if implemented.

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