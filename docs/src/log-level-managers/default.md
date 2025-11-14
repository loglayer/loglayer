---
title: Default Log Level Manager
description: The default log level manager used in LogLayer.
---

# Default Log Level Manager

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Flog-level-manager)](https://www.npmjs.com/package/@loglayer/log-level-manager)

[Log Level Manager Source](https://github.com/loglayer/loglayer/tree/master/packages/core/log-level-manager)

The Default Log Level Manager is the base log level manager used by LogLayer. It provides independent log level management for each logger instance, with children inheriting the initial log level from their parent.

::: info Batteries included
This log level manager is automatically used when creating a new LogLayer instance. You should not need to use
this log level manager directly.
:::

## Installation

This package is included with the `loglayer` package, so you don't need to install it separately.

It is, however, available as a standalone package:

::: code-group
```bash [npm]
npm install @loglayer/log-level-manager
```

```bash [yarn]
yarn add @loglayer/log-level-manager
```

```bash [pnpm]
pnpm add @loglayer/log-level-manager
```
:::

## Usage

### Basic Usage

```typescript
import { LogLayer, ConsoleTransport, LogLevel } from "loglayer";
import { DefaultLogLevelManager } from "@loglayer/log-level-manager";

const logger = new LogLayer({
  transport: new ConsoleTransport({
    logger: console
  })
  // NOTE: This is redundant and unnecessary since DefaultLogLevelManager is already 
  // the default log level manager when LogLayer is created.
}).withLogLevelManager(new DefaultLogLevelManager());

// Set log level
logger.setLevel(LogLevel.warn);

// Log with different levels
logger.info('This will not be logged'); // Not logged
logger.warn('This will be logged'); // Logged
```

### Child Loggers

With the Default Log Level Manager, child loggers inherit the log level from their parent when created, but subsequent changes to the parent's log level do not affect existing children:

```typescript
import { LogLayer, ConsoleTransport, LogLevel } from "loglayer";

const parentLog = new LogLayer({
  transport: new ConsoleTransport({
    logger: console
  })
});

// Set parent log level
parentLog.setLevel(LogLevel.warn);

// Create child - inherits parent's log level (warn)
const childLog = parentLog.child();

// Change parent log level
parentLog.setLevel(LogLevel.debug);

// Child is not affected - still at warn level
childLog.info('This will not be logged'); // Not logged (child still at warn)
parentLog.info('This will be logged'); // Logged (parent changed to debug)
```

## Behavior

- **Initial Inheritance**: When a child logger is created, it inherits the current log level from its parent
- **Independent Changes**: After creation, parent and child loggers maintain independent log level settings
- **No Propagation**: Changes to the parent's log level do not propagate to existing children

