---
title: Configuration Options for LogLayer Transports
description: Learn how to configure LogLayer transports
---

# Transport Configuration

All LogLayer transports share a common set of configuration options that control their behavior. These options are passed to the transport constructor when creating a new transport instance.

## Common Configuration Options

### Required Parameters

None - all parameters are optional.

### Optional Parameters

| Name | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | - | A unique identifier for the transport. If not provided, a random ID will be generated. This is used if you need to call getLoggerInstance() on the LogLayer instance |
| `enabled` | `boolean` | `true` | If false, the transport will not send any logs to the logger. Useful for temporarily disabling a transport |
| `consoleDebug` | `boolean` | `false` | If true, the transport will also log messages to the console. Useful for debugging transport behavior |
| `level` | `"trace" \| "debug" \| "info" \| "warn" \| "error" \| "fatal"` | `"trace"` | Minimum log level to process. Messages with a lower priority level will be ignored |

## Example Usage

Here's an example of configuring a transport with common options:

```typescript
import { LogLayer } from 'loglayer'
import { PinoTransport } from "@loglayer/transport-pino"
import pino from 'pino'

const pinoLogger = pino()

const transport = new PinoTransport({
  // Custom identifier for the transport
  id: 'main-pino-transport',
  
  // Your configured logger instance
  logger: pinoLogger,
  
  // Disable the transport temporarily
  enabled: process.env.NODE_ENV !== 'test',
  
  // Enable console debugging
  consoleDebug: process.env.DEBUG === 'true',
  
  // Set minimum log level (only process info and above)
  level: 'info'
})

const log = new LogLayer({
  transport
})
```
