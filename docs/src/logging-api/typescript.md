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
  interface LogLayerContext {
    userId?: string;
    sessionId?: string;
    requestId?: string;
    siteName?: string;
    [key: string]: any; // Allow any other properties
  }

  interface LogLayerMetadata {
    operation?: string;
    duration?: number;
    ipAddress?: string;
    userAgent?: string;
    [key: string]: any; 
  }

  interface LogLayerData {
    errorCode?: string;
    stackTrace?: string;
    [key: string]: any;
  }
}
```

