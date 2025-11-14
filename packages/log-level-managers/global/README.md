# Global Log Level Manager for LogLayer

[![NPM Version](https://img.shields.io/npm/v/%40loglayer%2Flog-level-manager-global)](https://www.npmjs.com/package/@loglayer/log-level-manager-global)
[![NPM Downloads](https://img.shields.io/npm/dm/%40loglayer%2Flog-level-manager-global)](https://www.npmjs.com/package/@loglayer/log-level-manager-global)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

A log level manager for [LogLayer](https://loglayer.dev) that applies log level changes to all loggers globally, regardless of whether they are parent or child loggers.

## Installation

```bash
npm install @loglayer/log-level-manager-global
```

## Usage

```typescript
import { LogLayer, ConsoleTransport } from "loglayer";
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
```

## Documentation

For more details, visit [https://loglayer.dev/log-level-managers/global](https://loglayer.dev/log-level-managers/global)

