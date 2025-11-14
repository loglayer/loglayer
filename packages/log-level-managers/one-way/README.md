# One Way Log Level Manager for LogLayer

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Flog-level-manager-one-way)](https://www.npmjs.com/package/@loglayer/log-level-manager-one-way)
[![NPM Downloads](https://img.shields.io/npm/dm/%40loglayer%2Flog-level-manager-one-way)](https://www.npmjs.com/package/@loglayer/log-level-manager-one-way)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

A log level manager for [LogLayer](https://loglayer.dev) that keeps log levels synchronized between parent and children. Parent changes affect children, but child changes do not affect parents.

## Installation

```bash
npm install @loglayer/log-level-manager-one-way
```

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
childLog.info('This will not be logged'); // Not logged (affected by parent)

// Child changes do not affect parent
childLog.setLevel(LogLevel.debug);
parentLog.debug('This will not be logged'); // Not logged (parent still at warn)
childLog.debug('This will be logged'); // Logged (child changed to debug)
```

## Documentation

For more details, visit [https://loglayer.dev/log-level-managers/one-way](https://loglayer.dev/log-level-managers/one-way)

