---
title: Default Context Manager
description: The default context manager used in LogLayer.
---

# Default Context Manager

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Fcontext-manager)](https://www.npmjs.com/package/@loglayer/context-manager)

[Context Manager Source](https://github.com/loglayer/loglayer/tree/master/packages/core/context-manager)

The Default Context Manager is the base context manager used by LogLayer. It provides a simple key-value store for managing context data with independent context for each logger instance.

::: info
This context manager is automatically used when creating a new LogLayer instance. You should not need to use
this context manager directly.
:::

## Installation

This package is included with the `loglayer` package, so you don't need to install it separately.

It is, however, available as a standalone package:

::: code-group
```bash [npm]
npm install @loglayer/context-manager
```

```bash [yarn]
yarn add @loglayer/context-manager
```

```bash [pnpm]
pnpm add @loglayer/context-manager
```
:::

## Usage

### Basic Usage

```typescript
import { LogLayer, ConsoleTransport } from "loglayer";
import { DefaultContextManager } from "@loglayer/context-manager";

const logger = new LogLayer({
  transport: new ConsoleTransport({
    logger: console
  })
  // NOTE: This is redundant and unnecessary since DefaultContextManager is already 
  // the default context manager when LogLayer is created.
}).withContextManager(new DefaultContextManager());

// Set context
logger.setContext({
  requestId: "123",
  userId: "456"
});

// Log with context
logger.info("User action"); // Will include requestId and userId in the log entry
```

### Child Loggers

When creating child loggers, the Default Context Manager will:
1. Copy the parent's context to the child logger at creation time
2. Maintain independent context after creation

```typescript
parentLogger.setContext({ requestId: "123" });

const childLogger = parentLogger.child();
// Child inherits parent's context at creation via shallow-copy
childLogger.info("Initial log"); // Includes requestId: "123"

// Child can modify its context independently
childLogger.appendContext({ userId: "456" });
childLogger.info("User action"); // Includes requestId: "123" and userId: "456"

// Parent's context remains unchanged
parentLogger.info("Parent log"); // Only includes requestId: "123"
```
