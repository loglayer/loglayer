---
title: Migrating LogLayer to the latest version
description: Learn how to migrate different versions of LogLayer to the latest version.
---

# Migrating LogLayer to the latest version

## Migrating from 8.x to 9.x

New version 9 introduces [Lazy Evaluation](/logging-api/lazy-evaluation), a feature for deferring expensive computations in context and metadata using the `lazy()` function. Lazy values are only evaluated when the log level is enabled, avoiding unnecessary computation for disabled log levels.

*v9 does not have any breaking changes; no migration steps are necessary aside from upgrading any external loglayer dependencies to their next major version.*

## Migrating from 7.x to 8.x

New version 8 introduces [Log Level Managers](/log-level-managers/), a system for controlling how log levels are inherited and propagated between parent and child loggers. Log level managers provide fine-grained control over log level behavior, allowing you to choose between independent log level management, global log level changes, one-way propagation, or bidirectional synchronization.

*v8 does not have any breaking changes; no migration steps are necessary to upgrade from v7 -> v8 of `loglayer`.*

## Migrating from 6.x to 7.x

New version 7 introduces [Mixins](/mixins/), a system for extending LogLayer and LogBuilder prototypes with custom methods and functionality. Unlike plugins (which intercept and modify log processing) or transports (which send logs to destinations), mixins add new methods directly to the LogLayer API, enabling you to integrate third-party libraries and add domain-specific capabilities beyond logging.

*v7 does not have any breaking changes; no migration steps are necessary to upgrade from v6 -> v7 of `loglayer`.*

## Migrating from 5.x to 6.x

6.x introduces a new feature called [Context Managers](/context-managers/). In 99% of use-cases you do not need to do anything
as the default context manager is already used when creating a new LogLayer instance.

### linkParentContext

The option `linkParentContext` has been removed. If you need this functionality, then use the [Linked Context Manager](/context-managers/linked):

::: code-group
```bash [npm]
npm install @loglayer/context-manager-linked
```

```bash [yarn]
yarn add @loglayer/context-manager-linked
```

```bash [pnpm]
pnpm add @loglayer/context-manager-linked
```
:::

Then, use the plugin like this:
```typescript
import { LogLayer, ConsoleTransport } from "loglayer";
import { LinkedContextManager } from '@loglayer/context-manager-linked';

const parentLog = new LogLayer({
  transport: new ConsoleTransport({
    logger: console
  }),
}).withContextManager(new LinkedContextManager());

// Now any child loggers will now have linked context with the parent and vice versa
```

## Migrating from 4.x to 5.x

### Node.js version

The minimum Node.js version required is now 18.

### Transport System

The most significant change in 5.x is the introduction of a new transport system. Instead of specifying a logger type and instance directly, you now need to use transport-specific packages:

```typescript
// 4.x
const log = new LogLayer({
  logger: {
    instance: console,
    type: LoggerType.CONSOLE
  }
})

// 5.x
import { ConsoleTransport } from 'loglayer'

const log = new LogLayer({
  transport: new ConsoleTransport({
    logger: console
  })
})
```

You can find the full list of transports in the [Transport](/transports/) documentation.

### Configuration Changes

Several configuration options have been renamed or restructured:

```typescript
// 4.x
const log = new LogLayer({
  error: {
    serializer: mySerializer,
    fieldName: 'err'
  },
  context: {
    fieldName: 'context'
  },
  metadata: {
    fieldName: 'metadata'
  }
})

// 5.x
const log = new LogLayer({
  errorSerializer: mySerializer,
  errorFieldName: 'err',
  contextFieldName: 'context',
  metadataFieldName: 'metadata',
  errorFieldInMetadata: false // New option - defaults to false to match 4.x behavior
})
```

Here's a complete mapping of configuration options from 4.x to 5.x:

| 4.x Config | 5.x Config | Notes |
|------------|------------|-------|
| `logger.instance` | `transport` | Now uses transport classes instead of direct logger instances |
| `logger.type` | `transport` | Logger type is determined by the transport class used |
| `error.serializer` | `errorSerializer` | Moved to root level |
| `error.fieldName` | `errorFieldName` | Moved to root level |
| `error.copyMsgOnOnlyError` | `copyMsgOnOnlyError` | Moved to root level |
| `context.fieldName` | `contextFieldName` | Moved to root level |
| `metadata.fieldName` | `metadataFieldName` | Moved to root level |
| `enabled` | `enabled` | Unchanged |
| `prefix` | `prefix` | Unchanged |
| `consoleDebug` | `consoleDebug` | Unchanged |
| `muteContext` | `muteContext` | Unchanged |
| `muteMetadata` | `muteMetadata` | Unchanged |
| `plugins` | `plugins` | Unchanged |
| N/A | `errorFieldInMetadata` | New in 5.x - controls error object placement |

### getLoggerInstance Changes

The `getLoggerInstance()` method has been updated to support multiple transports. Each transport must now have a unique ID that is used to retrieve its logger instance:

```typescript
// 4.x
const log = new LogLayer({
  logger: {
    instance: console,
    type: LoggerType.CONSOLE
  }
});
const logger = log.getLoggerInstance(); // Returns the logger instance directly

// 5.x
const log = new LogLayer({
  transport: new ConsoleTransport({
    id: 'console', // ID is required and must be unique
    logger: console
  })
});
const logger = log.getLoggerInstance('console'); // Must specify the transport ID

// 5.x with multiple transports
const log = new LogLayer({
  transport: [
    new ConsoleTransport({
      id: 'console',
      logger: console
    }),
    new WinstonTransport({
      id: 'winston',
      logger: winstonLogger
    })
  ]
});
const consoleLogger = log.getLoggerInstance('console');
const winstonLogger = log.getLoggerInstance('winston');
```

If the transport ID doesn't exist, `undefined` is returned.

### TypeScript Changes

#### Generic Type Parameters

The most significant change is the removal of generic type parameters from both the `ILogLayer` interface and `LogLayer` class:

```typescript
// 4.x
import pino, { P } from 'pino'
import { LogLayer, LoggerType } from 'loglayer'

const p = pino({
  level: 'trace'
})

const log = new LogLayer<P.Logger>({
  logger: {
    instance: p,
    type: LoggerType.PINO,
  },
})
```

```typescript
// 5.x
import pino, { P } from 'pino'
import { LogLayer } from 'loglayer'
import { PinoTransport } from "@loglayer/transport-pino"

const p = pino({
  level: 'trace'
})

// No more generic type parameters
const log = new LogLayer({
  transport: new PinoTransport({
    logger: p
  })
})
```
