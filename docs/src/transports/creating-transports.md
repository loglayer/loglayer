---
title: Creating Custom Transports
description: Learn how to create custom transports for LogLayer
---

# Creating Transports

To integrate a logging library with LogLayer, you must create a transport. A transport is a class that translates LogLayer's standardized logging format into the format expected by your target logging library or service.

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

## Implementing a Transport

The key requirement for any transport is extending the `BaseTransport` or `LoggerlessTransport` class and implementing the `shipToLogger` method. 

This method is called by LogLayer whenever a log needs to be sent, and it's where you transform LogLayer's standardized format into the format your target library or service expects.

## Types of Transports

LogLayer supports two types of transports:

### Logger-Based Transports

For libraries that follow a common logging interface with methods like `info()`, `warn()`, `error()`, `debug()`, etc., extend the `BaseTransport` class.

The `BaseTransport` class provides a `logger` property where users pass in their logging library instance:

```typescript
import {
  BaseTransport,
  type LogLayerTransportConfig,
  type LogLayerTransportParams,
} from "@loglayer/transport";

export interface CustomLoggerTransportConfig extends LogLayerTransportConfig<ConsoleType> {
  // Add configuration options here if necessary
}

export class CustomLoggerTransport extends BaseTransport<YourLoggerType> {
  constructor(config: CustomLoggerTransportConfig) {
    super(config);
  }

  shipToLogger({ logLevel, messages, data, hasData }: LogLayerTransportParams) {
    if (data && hasData) {
      // Most logging libraries expect data as first or last parameter
      messages.unshift(data); // or messages.push(data);
    }

    switch (logLevel) {
      case LogLevel.info:
        this.logger.info(...messages);
        break;
      case LogLevel.warn:
        this.logger.warn(...messages);
        break;
      case LogLevel.error:
        this.logger.error(...messages);
        break;
      // ... handle other log levels
    }

    return messages;
  }
}
```

To use this transport, you must provide a logger instance when creating it:

```typescript
import { LogLayer } from 'loglayer';
import { YourLogger } from 'your-logger-library';

// Initialize your logging library
const loggerInstance = new YourLogger();

// Create LogLayer instance with the transport
const log = new LogLayer({
  transport: new CustomLoggerTransport({
    logger: loggerInstance  // Required: the logger instance is passed here
  })
});
```

### HTTP / Cloud Service Transports

For services that have an HTTP API to ship logs to and do not provide an SDK, you can extend the
`HTTPTransport` class using the [HTTP Transport](http.md).

### Loggerless Transports

For services or libraries that don't follow the common logging interface (e.g., analytics services, monitoring tools), extend the `LoggerlessTransport` class. 

Unlike `BaseTransport`, `LoggerlessTransport` doesn't provide a `logger` property since these services typically don't require a logger instance. Instead, you'll usually initialize your service in the constructor:

::: info
All loggerless transports have an optional `level` input as part of configuration. This is used by the `LoggerlessTransport`
class to filter out logs that are below the specified level. You do not need to do any work around filtering based on level.
:::

```typescript
import { 
  LoggerlessTransport, 
  type LogLayerTransportParams,
  type LoggerlessTransportConfig
} from "@loglayer/transport";

export interface CustomServiceTransportConfig extends LoggerlessTransportConfig {
  // Add configuration options here if necessary
}

export class CustomServiceTransport extends LoggerlessTransport {
  private service: YourServiceType;

  constructor(config: CustomServiceTransportConfig) {
    super(config);
    this.service = new YourServiceType(config);
  }

  shipToLogger({ logLevel, messages, data, hasData }: LogLayerTransportParams) {
    const payload = {
      level: logLevel,
      message: messages.join(" "),
      timestamp: new Date().toISOString(),
      ...(data && hasData ? data : {})
    };

    // Send to your service
    this.service.send(payload);

    return messages;
  }
}
```

To use this transport, you only need to provide the configuration for your service:

```typescript
import { LogLayer } from 'loglayer';

// Create LogLayer instance with the transport
const log = new LogLayer({
  transport: new CustomServiceTransport({
    // No logger property needed, just your service configuration
    apiKey: 'your-api-key',
    endpoint: 'https://api.yourservice.com/logs'
  })
});
```

## `shipToLogger` Parameters

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

For example, if a user does the following:

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

## Resource Cleanup with Disposable

If your transport needs to clean up resources (like network connections, file handles, or external service connections), 
you can implement the [`Disposable`](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-2.html#using-declarations-and-explicit-resource-management) interface. 

LogLayer will automatically call the dispose method when:

- The transport is replaced using `withFreshTransports()`

### Implementing Disposable

To make your transport disposable:

1. Add `Disposable` to your class implementation
2. Implement the `[Symbol.dispose]()` method
3. Add a flag to track the disposed state
4. Guard your methods against calls after disposal

Here's an example:

```typescript
export class MyTransport extends LoggerlessTransport implements Disposable {
  private isDisposed = false;
  private client: ExternalServiceClient;

  constructor(config: MyTransportConfig) {
    super(config);
    this.client = new ExternalServiceClient(config);
  }

  shipToLogger({ logLevel, messages, data, hasData }: LogLayerTransportParams) {
    if (this.isDisposed) return messages;

    // Implementation
    this.client.send({
      level: logLevel,
      message: messages.join(" "),
      ...(data && hasData ? data : {})
    });

    return messages;
  }

  [Symbol.dispose](): void {
    if (this.isDisposed) return;
    
    // Clean up resources
    this.client?.close();
    this.isDisposed = true;
  }
}
```

:::tip
Always implement `Disposable` if your transport maintains connections or holds onto resources that need cleanup. This ensures proper resource management and prevents memory leaks.
:::

For a real-world example of a transport that implements `Disposable`, see the [Log Rotation Transport Source](/transports/log-file-rotation) implementation which properly manages file handles.

## Examples

### Logger-Based Example: Console Transport

```typescript
import { BaseTransport, LogLevel, LogLayerTransportParams } from "@loglayer/transport";

export class ConsoleTransport extends BaseTransport<ConsoleType> {
  shipToLogger({ logLevel, messages, data, hasData }: LogLayerTransportParams) {
    if (data && hasData) {
      // put object data as the first parameter  
      messages.unshift(data);
    }

    switch (logLevel) {
      case LogLevel.info:
        this.logger.info(...messages);
        break;
      case LogLevel.warn:
        this.logger.warn(...messages);
        break;
      case LogLevel.error:
        this.logger.error(...messages);
        break;
      case LogLevel.trace:
        this.logger.trace(...messages);
        break;
      case LogLevel.debug:
        this.logger.debug(...messages);
        break;
      case LogLevel.fatal:
        this.logger.error(...messages);
        break;
    }

    return messages;
  }
}
```

### Loggerless Example: DataDog Transport

For an example of a loggerless transport that sends logs to a third-party service, see the [Datadog Transport](https://github.com/loglayer/loglayer/blob/master/packages/transports/datadog/src/DataDogTransport.ts) implementation.

### HTTP Transport Example

For an example of a transport that wraps the [HTTP Transport](http.md), see the source code for the [VictoriaLogs Transport](victoria-logs.md).

## Boilerplate / Template Code

A sample project that you can use as a template is provided here:

[GitHub Boilerplate Template](https://github.com/loglayer/loglayer-transport-boilerplate)
