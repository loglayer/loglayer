---
title: Creating Custom Transports
description: Learn how to create custom transports for LogLayer
---

# Creating Transports

To integrate a logging library with LogLayer, you must create a transport. A transport is a class that translates LogLayer's standardized logging format into the format expected by your target logging library.

## Installation

To implement a transport, you must install the `@loglayer/transport` package.

::: code-group
```bash [npm]
npm install @loglayer/transport
```

```bash [yarn]
yarn add @loglayer/transport
```

```bash [pnpm]
pnpm add @loglayer/transport
```
:::

## Basic Structure

A transport in LogLayer is a class that extends the `BaseTransport` class from `@loglayer/transport` and implements the `shipToLogger()` method. Here's the basic structure:

```typescript
import { BaseTransport, LogLayerTransportParams } from "@loglayer/transport";

export class CustomTransport extends BaseTransport<YourLoggerType> {
  shipToLogger({ logLevel, messages, data, hasData }: LogLayerTransportParams): any[] {
    // Your implementation here
    return messages;
  }
}
```

### Transport Parameters

LogLayer calls the `shipToLogger` method of a transport at the end of log processing to send the log to the target logging library. 

It receives a `LogLayerTransportParams` object with these fields:

```typescript
interface LogLayerTransportParams {
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

### Shipping to the Logger

The transport must do the following:

- Pass the `data` object to the logger if `hasData` is true. Depending on the logger, this may be the first or last argument.
- Pass the `messages` array to the logger as the remaining arguments.
- Return the finalized `messages` array.

### Example using `console`

```typescript
import { BaseTransport, LogLevel, LogLayerTransportParams } from "@loglayer/transport";

export class ConsoleTransport extends BaseTransport<ConsoleType> {
  shipToLogger({ logLevel, messages, data, hasData }: LogLayerTransportParams) {
    if (data && hasData) {
      // put object data as the first parameter  
      messages.unshift(data);
      // some libraries may want it as the last parameter
      // messages.push(data);
    }

    // now ship the message to the logger
    switch (logLevel) {
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

### How this works

If one did the following:

```typescript
logger.withMetadata({foo: 'bar'}).info('hello world', 'foo');
```

The parameters passed to `shipToLogger` would be:

```typescript
{
  logLevel: LogLevel.info,
  messages: ['hello world', 'foo'],
  data: {foo: 'bar'},
  hasData: true
}
```

This would be translated to the following:

```typescript
console.info({foo: 'bar'}, 'hello world', 'foo');
```
