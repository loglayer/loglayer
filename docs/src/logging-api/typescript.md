---
title: LogLayer Tips for Typescript
description: Notes on using LogLayer with Typescript
---

# Typescript Tips

## Use `ILogLayer` if you need to type your logger

`ILogLayer` is the interface implemented by `LogLayer`. By using this interface,
you will also be able to use the mock `MockLogLayer` class for unit testing.

```typescript
import type { ILogLayer } from 'loglayer'

const logger: ILogLayer = new LogLayer()
```

## Use `LogLevelType` if you need to type your log level when creating a logger

```typescript
import type { LogLevelType } from 'loglayer'

const logger = new LogLayer({ 
  transport: new ConsoleTransport({
    level: process.env.LOG_LEVEL as LogLevelType
  })
})
```

## Use `LogLayerTransport` if you need to type an array of transports

```typescript
import type { LogLayerTransport } from 'loglayer'

const transports: LogLayerTransport[] = [
  new ConsoleTransport({
    level: process.env.LOG_LEVEL as LogLevelType
  }),
  new FileTransport({
    level: process.env.LOG_LEVEL as LogLevelType
  })
]

const logger = new LogLayer({ 
  transport: transports,
})
```

## Override types for custom IntelliSense

You can extend LogLayer's base types to provide custom IntelliSense for your specific use case. This is particularly useful when you have consistent fields across your application.

Create a `loglayer.d.ts` (or any `d.ts`) file in your project source:

```typescript
// loglayer.d.ts
declare module "loglayer" {
  /**
   * Defines the structure for context data that persists across multiple log entries 
   * within the same context scope. This is set using log.withContext().
   */
  interface LogLayerContext {
    userId?: string;
    sessionId?: string;
    requestId?: string;
    siteName?: string;
    [key: string]: any; // Allow any other properties
  }

  /**
   * Defines the structure for metadata that can be attached to individual log entries. 
   * This is set using log.withMetadata() / log.metadataOnly().
   */
  interface LogLayerMetadata {
    operation?: string;
    duration?: number;
    ipAddress?: string;
    userAgent?: string;
    [key: string]: any; 
  }

}
```

With the type overrides in place, you'll get full IntelliSense support:

```typescript
import { LogLayer } from 'loglayer';
import { ConsoleTransport } from '@loglayer/transport-console';
// Optional import if you need to define constants or types
import type { LogLayerContext, LogLayerMetadata } from 'loglayer';

const log = new LogLayer({
  transport: new ConsoleTransport()
});


// Set persistent context - IntelliSense will suggest userId, sessionId, requestId, siteName
log.withContext({
  userId: "user123",
  sessionId: "sess456", 
  requestId: "req789",
  siteName: "myapp.com"
});
```

