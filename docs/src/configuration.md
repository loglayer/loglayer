---
title: Configuring LogLayer
description: Learn how to configure LogLayer to customize its behavior
---

# Configuration

LogLayer can be configured with various options to customize its behavior. Here's a comprehensive guide to all available configuration options.

## Basic Configuration

When creating a new LogLayer instance, you can pass a configuration object:

```typescript
import { LogLayer, ConsoleTransport } from 'loglayer'

const log = new LogLayer({
  transport: new ConsoleTransport({
    logger: console,
  }),
  // ... other options
})
```

## Configuration Options

### Transport Configuration

The `transport` option is the only required configuration. It specifies which logging library to use:

```typescript
{
  // Can be a single transport or an array of transports
  transport: new ConsoleTransport({
    logger: console,
  })
}
```

You can also pass an array of transports to the `transport` option. This is useful if you want to send logs to multiple destinations.

```typescript
{
  transport: [
    new ConsoleTransport({ logger: console }), 
    new DatadogBrowserLogsTransport({ logger: datadogBrowserLogs })],
}
```

For more transport options, see the [Transport Configuration](./transports/configuration) section.

### Message Prefixing

You can add a prefix to all log messages:

```typescript
{
  // Will prepend "[MyApp]" to all log messages
  prefix: '[MyApp]'
}
```

### Logging Control

Control whether logging is enabled:

```typescript
{
  // Set to false to disable all logging (default: true)
  enabled: true
}
```

See the [Enabling/Disabling Logging](./logging-api/basic-logging#enabling-disabling-logging) section for more details.

### Debugging

If you're implementing a transport, you can set the `consoleDebug` option to `true` to output to the console before sending to the logging library:

```typescript
{
  // Useful for debugging - will output to console before sending to logging library
  consoleDebug: true
}
```

This is useful when:

- Debugging why logs aren't appearing in your logging library
- Verifying the data being sent to the logging library
- Testing log formatting

### Error Handling Configuration

Configure how errors are handled and serialized:

```typescript
{
  // Function to transform Error objects (useful if logging library doesn't handle errors well)
  errorSerializer: (err) => ({ message: err.message, stack: err.stack }),
  
  // Field name for errors (default: 'err')
  errorFieldName: 'err',
  
  // Copy error.message to log message when using errorOnly() (default: false)
  copyMsgOnOnlyError: true,
  
  // Include error in metadata instead of root level (default: false)
  errorFieldInMetadata: false
}
```

#### Recommended Error Serializer

For production applications, we recommend using the [`serialize-error`](https://www.npmjs.com/package/serialize-error) package as your error serializer. This package properly serializes Error objects including nested errors, circular references, and non-enumerable properties.

**Installation:**

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

**Usage:**

```typescript
import { serializeError } from 'serialize-error'

const log = new LogLayer({
  errorSerializer: serializeError,
  transport: new ConsoleTransport({ logger: console }),
})
```

### Data Structure Configuration

::: tip
See [error handling configuration](#error-handling-configuration) for configuring the error field name and placement.
:::

Control how context and metadata are structured in log output:

```typescript
{
  // Put context data in a specific field (default: flattened)
  contextFieldName: 'context',
  
  // Put metadata in a specific field (default: flattened)
  metadataFieldName: 'metadata',

  // Disable context/metadata in log output
  muteContext: false,
  muteMetadata: false
}
```

Example output with field names configured:
```json
{
  "level": 30,
  "time": 1638138422796,
  "msg": "User logged in",
  "context": {
    "requestId": "123"
  },
  "metadata": {
    "userId": "456"
  }
}
```

Example output with flattened fields (default):
```json
{
  "level": 30,
  "time": 1638138422796,
  "msg": "User logged in",
  "requestId": "123",
  "userId": "456"
}
```

### Groups

Groups let you route logs to specific transports based on named categories, with per-group log levels:

```typescript
{
  // Define named routing groups
  groups: {
    database: { transports: ['datadog'], level: 'error' },
    auth: { transports: ['sentry', 'datadog'], level: 'warn' },
  },

  // Only these groups are active (env LOGLAYER_GROUPS overrides)
  activeGroups: ['database', 'auth'],

  // What happens to ungrouped logs (default: 'all')
  ungrouped: 'all',  // 'all' | 'none' | string[]
}
```

See [Groups](/logging-api/groups) for full documentation on routing, runtime management, and environment variable support.

### Plugin System

Plugins are used to modify logging behavior. See the [Plugins](./plugins/index) section for more information.

## Retrieving Configuration

You can retrieve the current configuration using the `getConfig()` method:

```typescript
const log = new LogLayer({
  transport: new ConsoleTransport({ logger: console }),
  prefix: '[MyApp]',
  enabled: true,
})

const config = log.getConfig()
// Returns the configuration object used to initialize the logger
```

This method returns the complete configuration object, including any default values that were applied during initialization.

## Complete Configuration Example

Here's an example showing all configuration options:

```typescript
const log = new LogLayer({
  // Required: Transport configuration
  transport: new ConsoleTransport({
    logger: console,
  }),
  
  // Optional configurations
  prefix: '[MyApp]',
  enabled: true,
  consoleDebug: false,
  
  // Error handling
  errorSerializer: (err) => ({ message: err.message, stack: err.stack }),
  errorFieldName: 'error',
  copyMsgOnOnlyError: true,
  errorFieldInMetadata: false,
  
  // Data structure
  contextFieldName: 'context',
  metadataFieldName: 'metadata',
  muteContext: false,
  muteMetadata: false,

  // Plugins
  plugins: [
    {
      id: 'timestamp-plugin',
      onBeforeDataOut: ({ data }) => {
        if (data) {
          data.timestamp = Date.now()
        }
        return data
      }
    }
  ],

  // Groups (route logs to specific transports)
  groups: {
    database: { transports: ['my-transport-id'], level: 'error' },
  },
  activeGroups: null,  // null = all groups active
  ungrouped: 'all',    // ungrouped logs go to all transports
})
``` 