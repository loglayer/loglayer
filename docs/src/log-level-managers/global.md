---
title: Global Log Level Manager
description: Apply log level changes to all loggers globally in LogLayer.
---

# Global Log Level Manager

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Flog-level-manager-global)](https://www.npmjs.com/package/@loglayer/log-level-manager-global)

[Log Level Manager Source](https://github.com/loglayer/loglayer/tree/master/packages/log-level-managers/global)

A log level manager that applies log level changes to all loggers globally, regardless of whether they are parent or child loggers.

## Installation

::: code-group
```bash [npm]
npm install @loglayer/log-level-manager-global
```

```bash [yarn]
yarn add @loglayer/log-level-manager-global
```

```bash [pnpm]
pnpm add @loglayer/log-level-manager-global
```
:::

## Usage

```typescript
import { LogLayer, ConsoleTransport, LogLevel } from "loglayer";
import { GlobalLogLevelManager } from '@loglayer/log-level-manager-global';

const logger1 = new LogLayer({
  transport: new ConsoleTransport({
    logger: console
  }),
}).withLogLevelManager(new GlobalLogLevelManager());

const logger2 = new LogLayer({
  transport: new ConsoleTransport({
    logger: console
  }),
}).withLogLevelManager(new GlobalLogLevelManager());

// Changing log level on logger1 affects logger2 as well
logger1.setLevel(LogLevel.warn);

logger1.info('This will not be logged'); // Not logged
logger2.info('This will also not be logged'); // Not logged (affected by logger1's change)

// Changing log level on logger2 also affects logger1
logger2.setLevel(LogLevel.debug);

logger1.debug('This will be logged'); // Logged (affected by logger2's change)
logger2.debug('This will be logged'); // Logged
```

### With Child Loggers

```typescript
import { LogLayer, ConsoleTransport, LogLevel } from "loglayer";
import { GlobalLogLevelManager } from '@loglayer/log-level-manager-global';

const parentLog = new LogLayer({
  transport: new ConsoleTransport({
    logger: console
  }),
}).withLogLevelManager(new GlobalLogLevelManager());

const childLog = parentLog.child();

// Changing log level on parent affects all loggers globally
parentLog.setLevel(LogLevel.warn);

// Both parent and child are affected
parentLog.info('This will not be logged'); // Not logged
childLog.info('This will not be logged'); // Not logged

// Changing log level on child also affects all loggers globally
childLog.setLevel(LogLevel.debug);

// Both parent and child are affected
parentLog.debug('This will be logged'); // Logged
childLog.debug('This will be logged'); // Logged
```

## Behavior

- **Global State**: All loggers using `GlobalLogLevelManager` share the same global log level state
- **Bidirectional**: Changes to any logger affect all other loggers using the same manager
- **No Isolation**: There is no isolation between different logger instances

## Use Cases

- **Application-wide Log Level Control**: When you want to control log levels across your entire application from a single point
- **Dynamic Log Level Adjustment**: When you need to change log levels globally at runtime (e.g., based on environment or configuration)

