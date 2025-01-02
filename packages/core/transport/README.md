# loglayer-transport

[![NPM version](https://img.shields.io/npm/v/loglayer-transport.svg?style=flat-square)](https://www.npmjs.com/package/@loglayer/transport)
![NPM Downloads](https://img.shields.io/npm/dm/@loglayer/transport)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/)

This is the base transport used for implementing transports for use with [loglayer](https://loglayer.github.io).

## Installation

```bash
npm i loglayer @loglayer/transport
```

## Implementation example using console

The `shipToLogger` method is the method that will be called by the loglayer to send the logs to the logger.

`shipToLogger(params: LogLayerTransportParams): any[];`

```typescript
export interface LogLayerTransportParams {
  /**
   * The log level of the message
   */
  logLevel: LogLevel;
  /**
   * The parameters that were passed to the log message method (eg: info / warn / debug / error)
   */
  messages: any[];
  /**
   * Object data such as metadata, context, and / or error data
   */
  data?: Record<string, any>;
  /**
   * If true, the data object is included in the message parameters
   */
  hasData?: boolean;
}
```

```typescript
// console-transport.ts
import type { LogLayerTransportParams } from "@loglayer/transport";
import { BaseTransport, LogLevel } from "@loglayer/transport";

type ConsoleType = typeof console;

export class ConsoleTransport extends BaseTransport<ConsoleType> {
  shipToLogger({ logLevel, messages, data, hasData }: LogLayerTransportParams) {
    if (data && hasData) {
      // put object data as the first parameter
      messages.unshift(data);
    }

    switch (logLevel) {
      // this.logger is the instance of the logger passed in the constructor
      case LogLevel.info:
        // @ts-ignore
        this.logger.info(...messages);
        break;
      case LogLevel.warn:
        // @ts-ignore
        this.logger.warn(...messages);
        break;
      case LogLevel.error:
        // @ts-ignore
        this.logger.error(...messages);
        break;
      case LogLevel.trace:
        // @ts-ignore
        this.logger.trace(...messages);
        break;
      case LogLevel.debug:
        // @ts-ignore
        this.logger.debug(...messages);
        break;
      case LogLevel.fatal:
        // @ts-ignore
        this.logger.error(...messages);
        break;
    }

    return messages;
  }
}
```

### Usage with loglayer

```typescript
import { LogLayer } from 'loglayer'
import { ConsoleTransport } from "./console-transport.ts";

const logger = new LogLayer({
  transport: new ConsoleTransport({
    logger: console,
  }),
})
```

## API

```typescript
class BaseTransport<LogLibrary extends LoggerLibrary> {
  constructor(config: LogLayerTransportConfig<LogLibrary>);

  /**
   * Sends the log data to the logger for transport
   */
  shipToLogger(params: LogLayerTransportParams): any[];
}
```

### LoggerLibrary

```typescript
/**
 * Logging methods that are common to logging libraries
 */
export interface LoggerLibrary {
  info(...data: any[]): void;
  warn(...data: any[]): void;
  error(...data: any[]): void;
  trace?: (...data: any[]) => void;
  debug(...data: any[]): void;
  fatal?: (...data: any[]) => void;
}
```

### LogLayerTransportConfig

```typescript
export interface LogLayerTransportConfig<LogLibrary> {
  /**
   * A user-defined identifier for the transport
   */
  id: string;
  /**
   * The logging library instance to use for logging
   */
  logger: LogLibrary;
  /**
   * If false, the transport will not send logs to the logger.
   * Default is true.
   */
  enabled?: boolean;
  /**
   * If true, the transport will log to the console for debugging purposes
   */
  consoleDebug?: boolean;
}
```