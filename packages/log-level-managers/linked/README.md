# Linked Log Level Manager for LogLayer

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Flog-level-manager-linked)](https://www.npmjs.com/package/@loglayer/log-level-manager-linked)
[![NPM Downloads](https://img.shields.io/npm/dm/%40loglayer%2Flog-level-manager-linked)](https://www.npmjs.com/package/@loglayer/log-level-manager-linked)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

A log level manager for [LogLayer](https://loglayer.dev) that keeps log levels synchronized between parent and children. Parent and child changes affect each other bidirectionally.

## Installation

```bash
npm install @loglayer/log-level-manager-linked
```

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
childLog.info('This will not be logged'); // Not logged (affected by parent)

// Child changes also affect parent
childLog.setLevel(LogLevel.debug);
parentLog.debug('This will be logged'); // Logged (affected by child)
childLog.debug('This will be logged'); // Logged (child changed to debug)
```

## Documentation

For more details, visit [https://loglayer.dev/log-level-managers/linked](https://loglayer.dev/log-level-managers/linked)

