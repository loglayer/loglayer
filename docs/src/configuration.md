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

You can also enable/disable logging programmatically:
```typescript
log.enableLogging()  // Enable logging
log.disableLogging() // Disable logging
```

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

### Plugin System

Plugins are used to modify logging behavior. See the [Plugins](./plugins/index) section for more information.

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
  ]
})
``` 