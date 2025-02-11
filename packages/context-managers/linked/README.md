# Linked Context Manager for LogLayer

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Fcontext-manager-linked)](https://www.npmjs.com/package/@loglayer/context-manager-linked)
[![NPM Downloads](https://img.shields.io/npm/dm/%40loglayer%2Fcontext-manager-linked)](https://www.npmjs.com/package/@loglayer/context-manager-linked)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

A context manager for [LogLayer](https://loglayer.dev) that keeps context linked between parent and child loggers.

This means that changes to the context in the parent / child / child of child loggers will affect all loggers.

## Installation

```bash
npm install @loglayer/context-manager-linked
```

## Usage

```typescript
import { LogLayer, ConsoleTransport } from "loglayer";
import { LinkedContextManager } from '@loglayer/context-manager-linked';

const parentLog = new LogLayer({
  transport: new ConsoleTransport({
    logger: console
  }),
}).withContextManager(new LinkedContextManager());

const childLog = parentLog.child();

childLog.withContext({
  module: 'users'
});

parentLog.withContext({
  app: 'myapp'
});

parentLog.info('Parent log');
childLog.info('Child log');

// Output includes: { module: 'users', app: 'myapp' }
// for both parentLog and childLog
```

## Documentation

For more details, visit [https://loglayer.dev/context-managers/linked](https://loglayer.dev/context-managers/linked) 
