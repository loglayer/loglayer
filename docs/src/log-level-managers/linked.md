---
title: Linked Log Level Manager
description: Synchronize log levels bidirectionally between parent and child loggers in LogLayer.
---

# Linked Log Level Manager

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Flog-level-manager-linked)](https://www.npmjs.com/package/@loglayer/log-level-manager-linked)

[Log Level Manager Source](https://github.com/loglayer/loglayer/tree/master/packages/log-level-managers/linked)

A log level manager that keeps log levels synchronized between parent and children. Parent and child changes affect each other bidirectionally. Changes only apply to a parent and their children (not separate instances).

## Installation

::: code-group
```bash [npm]
npm install @loglayer/log-level-manager-linked
```

```bash [yarn]
yarn add @loglayer/log-level-manager-linked
```

```bash [pnpm]
pnpm add @loglayer/log-level-manager-linked
```
:::

## Usage

```typescript
import { LogLayer, ConsoleTransport, LogLevel } from "loglayer";
import { LinkedLogLevelManager } from '@loglayer/log-level-manager-linked';

const parentLog = new LogLayer({
  transport: new ConsoleTransport({
    logger: console
  }),
}).withLogLevelManager(new LinkedLogLevelManager());

const childLog = parentLog.child();

// Parent changes affect children
parentLog.setLevel(LogLevel.warn);

parentLog.info('This will not be logged'); // Not logged
childLog.info('This will not be logged'); // Not logged (affected by parent)

// Child changes also affect parent
childLog.setLevel(LogLevel.debug);

parentLog.debug('This will be logged'); // Logged (affected by child)
childLog.debug('This will be logged'); // Logged (child changed to debug)
```

### Nested Children

```typescript
import { LogLayer, ConsoleTransport, LogLevel } from "loglayer";
import { LinkedLogLevelManager } from '@loglayer/log-level-manager-linked';

const parentLog = new LogLayer({
  transport: new ConsoleTransport({
    logger: console
  }),
}).withLogLevelManager(new LinkedLogLevelManager());

const childLog = parentLog.child();
const grandchildLog = childLog.child();

// Parent changes affect all descendants
parentLog.setLevel(LogLevel.error);

parentLog.warn('This will not be logged'); // Not logged
childLog.warn('This will not be logged'); // Not logged (affected by parent)
grandchildLog.warn('This will not be logged'); // Not logged (affected by parent)

// Grandchild changes affect all ancestors
grandchildLog.setLevel(LogLevel.debug);

parentLog.debug('This will be logged'); // Logged (affected by grandchild)
childLog.debug('This will be logged'); // Logged (affected by grandchild)
grandchildLog.debug('This will be logged'); // Logged (grandchild changed to debug)
```

## Behavior

- **Bidirectional Propagation**: Parent changes propagate to all children, and child changes propagate to the parent and all siblings
- **Hierarchical**: Changes apply only within a parent-child hierarchy, not across separate logger instances
- **Shared Container**: All linked managers in a hierarchy share the same log level container, ensuring immediate synchronization

## Use Cases

- **Tightly Coupled Modules**: When you want log levels to be synchronized across a module hierarchy where any change should affect all related loggers
- **Shared Configuration**: When you need a single source of truth for log levels across a parent-child relationship
- **Dynamic Log Level Control**: When you want to be able to change log levels from any logger in the hierarchy and have it affect all others

