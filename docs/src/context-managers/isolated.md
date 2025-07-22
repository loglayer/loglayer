---
title: Isolated Context Manager
description: Maintain isolated context for each logger instance in LogLayer.
---

# Isolated Context Manager

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Fcontext-manager-isolated)](https://www.npmjs.com/package/@loglayer/context-manager-isolated)

[Context Manager Source](https://github.com/loglayer/loglayer/tree/master/packages/context-managers/isolated)

A context manager that maintains isolated context for each logger instance. When a child logger is created, it starts with no context data - it does not inherit from the parent.

This is useful when you want complete isolation between parent and child loggers, ensuring that context changes in one logger don't affect any other loggers.

This Context Manager was 99% vibe-coded.

[Vibe Code Prompts](https://github.com/loglayer/loglayer/tree/master/packages/context-managers/isolated/PROMPTS.md)

## Installation

::: code-group
```bash [npm]
npm install @loglayer/context-manager-isolated
```

```bash [yarn]
yarn add @loglayer/context-manager-isolated
```

```bash [pnpm]
pnpm add @loglayer/context-manager-isolated
```
:::

## Usage

```typescript
import { LogLayer, ConsoleTransport } from "loglayer";
import { IsolatedContextManager } from '@loglayer/context-manager-isolated';

const parentLog = new LogLayer({
  transport: new ConsoleTransport({
    logger: console
  }),
}).withContextManager(new IsolatedContextManager());

// Set context on parent logger
parentLog.withContext({
  userId: "123",
  requestId: "abc"
});

// Create child logger
const childLog = parentLog.child();

// Parent has context
parentLog.info('Parent log message');
// Output: { userId: "123", requestId: "abc" } Parent log message

// Child starts with NO context (isolation)
childLog.info('Child log message');
// Output: Child log message (no context data)

// Adding context to child doesn't affect parent
childLog.withContext({
  module: 'auth',
  action: 'login'
});

parentLog.info('Another parent message');
// Output: { userId: "123", requestId: "abc" } Another parent message

childLog.info('Another child message');
// Output: { module: 'auth', action: 'login' } Another child message
```

## Changelog

View the changelog [here](./changelogs/isolated-changelog.md). 