---
title: Configuration Options for LogLayer Transports
description: Learn how to configure LogLayer transports
---

# Transport Configuration

All LogLayer transports share a common set of configuration options that control their behavior. These options are passed to the transport constructor when creating a new transport instance.

## Common Configuration Options

```typescript
interface TransportConfig {
  /**
   * A unique identifier for the transport. If not provided, a random ID will be generated. This is used if you need to call getLoggerInstance() on the LogLayer instance.
   */
  id?: string;

  /**
   * The logging library instance to use for logging.
   * This is required and specific to each transport type.
   */
  logger: LoggerLibrary;

  /**
   * If false, the transport will not send any logs to the logger.
   * Useful for temporarily disabling a transport.
   * @default true
   */
  enabled?: boolean;

  /**
   * If true, the transport will also log messages to the console.
   * Useful for debugging transport behavior.
   * @default false
   */
  consoleDebug?: boolean;
}
```

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
  consoleDebug: process.env.DEBUG === 'true'
})

const log = new LogLayer({
  transport
})
```
