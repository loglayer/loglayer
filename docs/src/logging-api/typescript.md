---
title: LogLayer Tips for Typescript
description: Notes on using LogLayer with Typescript
---

# Typescript Tips

## Use `ILogLayer` if you need to type your logger

`ILogLayer` is the interface implemented by `LogLayer`. By using this interface,
you will also be able to use the mock `MockLogLayer` class for unit testing.

```typescript
import type{ ILogLayer } from 'loglayer'

const logger: ILogLayer = new LogLayer()
```

## Use `LogLevel` if you need to type your log level when creating a logger.

```typescript
import type { LogLevel } from 'loglayer'

const logger = new LogLayer({ 
  transport: new ConsoleTransport({
    level: process.env.LOG_LEVEL as LogLevel
  })
})
```
