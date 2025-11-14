---
title: One Way Log Level Manager
description: Synchronize log levels between parent and child loggers in LogLayer.
---

# One Way Log Level Manager

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Flog-level-manager-one-way)](https://www.npmjs.com/package/@loglayer/log-level-manager-one-way)

[Log Level Manager Source](https://github.com/loglayer/loglayer/tree/master/packages/log-level-managers/one-way)

A log level manager that keeps log levels synchronized between parent and children. Parent changes affect children, but child changes do not affect parents. Changes only apply to a parent and their children (not separate instances).

## Installation

::: code-group
```bash [npm]
npm install @loglayer/log-level-manager-one-way
```

```bash [yarn]
yarn add @loglayer/log-level-manager-one-way
```

```bash [pnpm]
pnpm add @loglayer/log-level-manager-one-way
```
:::

## Usage

```typescript
import { LogLayer, ConsoleTransport, LogLevel } from "loglayer";
import { OneWayLogLevelManager } from '@loglayer/log-level-manager-one-way';

const parentLog = new LogLayer({
  transport: new ConsoleTransport({
    logger: console
  }),
}).withLogLevelManager(new OneWayLogLevelManager());

const childLog = parentLog.child();

// Parent changes affect children
parentLog.setLevel(LogLevel.warn);

parentLog.info('This will not be logged'); // Not logged
childLog.info('This will not be logged'); // Not logged (affected by parent)

// Child changes do not affect parent
childLog.setLevel(LogLevel.debug);

parentLog.debug('This will not be logged'); // Not logged (parent still at warn)
childLog.debug('This will be logged'); // Logged (child changed to debug)
```

### Nested Children

```typescript
import { LogLayer, ConsoleTransport, LogLevel } from "loglayer";
import { OneWayLogLevelManager } from '@loglayer/log-level-manager-one-way';

const parentLog = new LogLayer({
  transport: new ConsoleTransport({
    logger: console
  }),
}).withLogLevelManager(new OneWayLogLevelManager());

const childLog = parentLog.child();
const grandchildLog = childLog.child();

// Parent changes affect all descendants
parentLog.setLevel(LogLevel.error);

parentLog.warn('This will not be logged'); // Not logged
childLog.warn('This will not be logged'); // Not logged (affected by parent)
grandchildLog.warn('This will not be logged'); // Not logged (affected by parent)

// Child changes only affect that child and its descendants
childLog.setLevel(LogLevel.debug);

parentLog.warn('This will not be logged'); // Not logged (parent still at error)
childLog.debug('This will be logged'); // Logged (child changed to debug)
grandchildLog.debug('This will be logged'); // Logged (affected by child)
```

## Behavior

- **One-way Propagation**: Parent changes propagate to all children, but child changes do not affect parents
- **Hierarchical**: Changes apply only within a parent-child hierarchy, not across separate logger instances
- **Independent Child Containers**: Each child has its own log level container, initialized from the parent but independent after creation

## Use Cases

- **Module-level Log Level Control**: When you want to control log levels for a specific module and all its sub-modules
- **Hierarchical Logging**: When you need different log levels for different parts of your application hierarchy

