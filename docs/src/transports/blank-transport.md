---
title: Blank Transport for LogLayer
description: Create custom transports quickly with LogLayer's BlankTransport
---

# Blank Transport <Badge type="warning" text="Browser" /> <Badge type="tip" text="Server" /> <Badge type="info" text="Deno" /> <Badge type="info" text="Bun" />

The built-in `BlankTransport` allows you to quickly create custom transports by providing your own `shipToLogger` function. This is perfect for simple custom logging logic, prototyping new transport ideas, or quick integrations with custom services.

[Transport Source](https://github.com/loglayer/loglayer/blob/master/packages/core/loglayer/src/transports/BlankTransport.ts)

::: tip
If you want to create more advanced / complex transports, it is recommended you read the [Creating Transports](./creating-transports.md) guide.
:::

## Installation

No additional packages needed beyond the core `loglayer` package:

::: code-group

```sh [npm]
npm i loglayer
```

```sh [pnpm]
pnpm add loglayer
```

```sh [yarn]
yarn add loglayer
```

:::

## Setup

```typescript
import { LogLayer, BlankTransport } from 'loglayer'

const log = new LogLayer({
  transport: new BlankTransport({
    shipToLogger: ({ logLevel, messages, data, hasData }) => {
      // Your custom logging logic here
      console.log(`[${logLevel}]`, ...messages, data && hasData ? data : '');
      
      // Return value is used for debugging when consoleDebug is enabled
      return messages;
    }
  })
})
```

## Configuration Options

### `shipToLogger` (Required)

The function that will be called to handle log shipping. This is the only required parameter for creating a custom transport.

- Type: `(params: LogLayerTransportParams) => any[]`
- Required: `true`

**Return Value**: The function must return an array (`any[]`). This return value is used for debugging purposes when `consoleDebug` is enabled - it will be logged to the console using the appropriate console method based on the log level.

The function receives a `LogLayerTransportParams` object with these fields:

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
   * Combined object data containing the metadata, context, and / or error data in a
   * structured format configured by the user.
   */
  data?: Record<string, any>;
  /**
   * If true, the data object is included in the message parameters
   */
  hasData?: boolean;
  /**
   * Individual metadata object passed to the log message method.
   */
  metadata?: Record<string, any>;
  /**
   * Error passed to the log message method.
   */
  error?: any;
  /**
   * Context data that is included with each log entry.
   */
  context?: Record<string, any>;
}
```

<!--@include: ./_partials/ship-to-logger-note.md-->

### `level`

Sets the minimum log level to process. Messages with a lower priority level will be ignored.
- Type: `"trace" | "debug" | "info" | "warn" | "error" | "fatal"`
- Default: `"trace"` (processes all log levels)

### `enabled`

If false, the transport will not send logs to the logger.
- Type: `boolean`
- Default: `true`

### `consoleDebug`

If true, the transport will log to the console for debugging purposes.
- Type: `boolean`
- Default: `false`

When `consoleDebug` is enabled, the return value from your `shipToLogger` function will be logged to the console using the appropriate console method based on the log level (e.g., `console.info()` for info logs, `console.error()` for error logs, etc.).

This is useful for debugging your custom transport logic and seeing exactly what data is being processed.


## Error Serialization

When using the BlankTransport, it's recommended to configure LogLayer with an `errorSerializer` to ensure errors are properly serialized before being passed to your `shipToLogger` function. The [`serialize-error`](https://www.npmjs.com/package/serialize-error) package is the recommended choice for consistent error serialization.

### Installation

::: code-group

```sh [npm]
npm install serialize-error
```

```sh [yarn]
yarn add serialize-error
```

```sh [pnpm]
pnpm add serialize-error
```

:::

### Usage

```typescript
import { LogLayer, BlankTransport } from 'loglayer'
import serializeError from 'serialize-error'

const log = new LogLayer({
  errorSerializer: serializeError,
  transport: new BlankTransport({
    shipToLogger: ({ logLevel, messages, data, hasData }) => {
      console.log(`[${logLevel}]`, ...messages, data && hasData ? data : '');
      return messages;
    }
  })
})
```

### Before and After Example

::: tip Error Field Name
The error appears in `data.err` by default, but this field name can be customized using the `errorFieldName` configuration option. See the [Error Handling Configuration](/configuration.html#error-handling) section for more details.
:::

**Without errorSerializer:**

```typescript
const log = new LogLayer({
  transport: new BlankTransport({
    shipToLogger: ({ logLevel, messages, data, hasData }) => {
      console.log(`[${logLevel}]`, ...messages, data && hasData ? data : '');
      return messages;
    }
  })
})

log.withError(new Error('Database connection failed')).error('Failed to connect');
// Output: [error] Failed to connect { err: [Error: Database connection failed] }
```

**With errorSerializer:**

```typescript
const log = new LogLayer({
  errorSerializer: serializeError,
  transport: new BlankTransport({
    shipToLogger: ({ logLevel, messages, data, hasData }) => {
      console.log(`[${logLevel}]`, ...messages, data && hasData ? data : '');
      return messages;
    }
  })
})

log.withError(new Error('Database connection failed')).error('Failed to connect');
// Output: [error] Failed to connect {
//   err: {
//     name: 'Error',
//     message: 'Database connection failed',
//     stack: 'Error: Database connection failed\n    at ...'
//   }
// }
```

## Examples

### Simple Console Logging

```typescript
import { LogLayer, BlankTransport } from 'loglayer'

const log = new LogLayer({
  transport: new BlankTransport({
    shipToLogger: ({ logLevel, messages, data, hasData }) => {
      const timestamp = new Date().toISOString();
      const message = messages.join(" ");
      const dataStr = data && hasData ? ` | ${JSON.stringify(data)}` : '';
      
      console.log(`[${timestamp}] [${logLevel.toUpperCase()}] ${message}${dataStr}`);
      
      // Return value is used for debugging when consoleDebug is enabled
      return messages;
    }
  })
})
```

```
log.withMetadata({ user: 'john' }).info('User logged in');
// Output: [2023-12-01T10:30:00.000Z] [INFO] User logged in | {"user":"john"}
```

### Custom API Integration

```typescript
import { LogLayer, BlankTransport } from 'loglayer'

const log = new LogLayer({
  transport: new BlankTransport({
    shipToLogger: ({ logLevel, messages, data, hasData }) => {
      const payload = {
        level: logLevel,
        message: messages.join(" "),
        timestamp: new Date().toISOString(),
        ...(data && hasData ? data : {})
      };

      // Send to your custom API
      fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(err => {
        console.error('Failed to send log to API:', err);
      });

      // Return value is used for debugging when consoleDebug is enabled
      return messages;
    }
  })
})
```

### Debug Mode

```typescript
import { LogLayer, BlankTransport } from 'loglayer'

const log = new LogLayer({
  transport: new BlankTransport({
    consoleDebug: true // This will also log to console for debugging
    shipToLogger: ({ logLevel, messages, data, hasData }) => {
      // Your custom logic here
      const payload = {
        level: logLevel,
        message: messages.join(" "),
        ...(data && hasData ? data : {})
      };

      // Send to external service
      fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // Return value is used for debugging when consoleDebug is enabled
      return messages;
    },
  })
})
```
