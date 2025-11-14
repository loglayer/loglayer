---
title: Log Level Managers
description: Learn how to create and use log level managers with LogLayer
---

# Log Level Managers

*New in LogLayer v8*.

Log level managers in LogLayer are responsible for managing log level settings across logger instances. They provide a way to control how log levels are inherited and propagated between parent and child loggers.

::: tip Do you need to specify a log level manager?
Log level managers are an advanced feature of LogLayer. 

Unless you need to manage log levels in a specific way, you can use the default log level manager, which is already automatically used when creating a new LogLayer instance.
:::

<!--@include: ./_partials/log-level-manager-list.md-->

## Log Level Manager Management

### Using a custom log level manager

You can set a custom log level manager using the `withLogLevelManager()` method.

Example usage:

```typescript
import { GlobalLogLevelManager } from '@loglayer/log-level-manager-global';

const logger = new LogLayer({
  transport: new ConsoleTransport({
    logger: console
  })
}).withLogLevelManager(new GlobalLogLevelManager());
```

::: tip
Use the `withLogLevelManager()` method right after creating the LogLayer instance. Using it after log levels have
already been set may result in unexpected behavior.
:::

### Obtaining the current log level manager

You can get the current log level manager instance using the `getLogLevelManager()` method:

```typescript
const logLevelManager = logger.getLogLevelManager();
```

You can also type the return value when getting a specific log level manager implementation:

```typescript
const globalLogLevelManager = logger.getLogLevelManager<GlobalLogLevelManager>();
```

