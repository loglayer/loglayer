---
title: Consola Transport for LogLayer
description: Learn how to use the Consola logging library with LogLayer
---

# Consola Transport

[Consola](https://github.com/unjs/consola) is an elegant and configurable console logger for Node.js and browser.

[Transport Source](https://github.com/loglayer/loglayer/tree/master/packages/transports/consola)

## Important Notes

- The default log level is `3` which excludes `debug` and `trace`
- Set level to `5` to enable all log levels
- Consola provides additional methods not available through LogLayer

## Installation

Install the required packages:

::: code-group

```sh [npm]
npm i loglayer @loglayer/transport-consola consola
```

```sh [pnpm]
pnpm add loglayer @loglayer/transport-consola consola
```

```sh [yarn]
yarn add loglayer @loglayer/transport-consola consola
```

:::

## Setup

```typescript
import { createConsola } from 'consola'
import { LogLayer } from 'loglayer'
import { ConsolaTransport } from "@loglayer/transport-consola"

const log = new LogLayer({
  transport: new ConsolaTransport({
    logger: createConsola({
      level: 5  // Enable all log levels
    })
  })
})
```

## Features

- Works in Node.js and browser
- Pretty error reporting
- Pluggable reporters
- Global instance
- Scoped loggers
- Pause/resume logging

## Log Level Mapping

| LogLayer | Consola |
|----------|---------|
| trace    | trace   |
| debug    | debug   |
| info     | info    |
| warn     | warn    |
| error    | error   |
| fatal    | fatal   |

## Configuration Options

### Basic Configuration

```typescript
const consola = createConsola({
  level: 5,               // Show all logs
  fancy: true,            // Enable fancy output
  formatOptions: {
    date: true,           // Show timestamps
    colors: true          // Enable colors
  }
})

const log = new LogLayer({
  transport: new ConsolaTransport({
    logger: consola
  })
})
```

### Custom Reporters

```typescript
const consola = createConsola({
  reporters: [
    {
      log: (logObj) => {
        // Custom log handling
        console.log(JSON.stringify(logObj))
      }
    }
  ]
})
```

### Scoped Loggers

```typescript
const consola = createConsola()
const scopedLogger = consola.withScope('api')

const log = new LogLayer({
  transport: new ConsolaTransport({
    logger: scopedLogger
  })
})
```

## Browser Usage

Consola works well in browsers:

```typescript
const consola = createConsola({
  // Browser-specific options
  fancy: true,
  formatOptions: {
    date: false,
    colors: true
  }
})

const log = new LogLayer({
  transport: new ConsolaTransport({
    logger: consola
  })
})
```

## Pause/Resume Logging

While this feature is available in Consola, it should be used directly:

```typescript
const consola = createConsola()

// Use directly for pause/resume
consola.pause()
consola.resume()

// Use LogLayer for standard logging
const log = new LogLayer({
  transport: new ConsolaTransport({
    logger: consola
  })
})
```

## Best Practices

1. Set appropriate log level (5 for all logs)
2. Use scoped loggers for better organization
3. Configure reporters based on environment
4. Enable fancy output for development
5. Consider using Consola directly for advanced features
``` 