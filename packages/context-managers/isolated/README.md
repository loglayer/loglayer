# Isolated Context Manager for LogLayer

[![npm version](https://badge.fury.io/js/@loglayer%2Fcontext-manager-isolated.svg)](https://badge.fury.io/js/@loglayer%2Fcontext-manager-isolated)
[![npm downloads](https://img.shields.io/npm/dm/@loglayer/context-manager-isolated.svg)](https://www.npmjs.com/package/@loglayer/context-manager-isolated)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

A context manager for [LogLayer](https://loglayer.dev) that maintains isolated context for each logger instance. When a child logger is created, it starts with no context data - it does not inherit from the parent.

## Installation

```bash
npm install @loglayer/context-manager-isolated
```

```bash
yarn add @loglayer/context-manager-isolated
```

```bash
pnpm add @loglayer/context-manager-isolated
```

## Quick Start

```typescript
import { LogLayer } from "loglayer";
import { IsolatedContextManager } from "@loglayer/context-manager-isolated";

const log = new LogLayer({
  // ... other configuration
}).withContextManager(new IsolatedContextManager());

// Set context on parent logger
log.withContext({ userId: "123", requestId: "abc" });

// Create child logger - it will NOT inherit parent context
const childLog = log.child();

// Parent has context
console.log(log.getContext()); // { userId: "123", requestId: "abc" }

// Child starts with empty context
console.log(childLog.getContext()); // {}
```

For more advanced usage and configuration options, visit the [documentation](https://loglayer.dev/context-managers/isolated.html). 