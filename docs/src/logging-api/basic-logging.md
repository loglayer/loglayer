---
title: Logging Basics With LogLayer
description: Learn how to log messages at different severity levels with LogLayer
---

# Basic Logging

LogLayer provides a simple and consistent API for logging messages at different severity levels. This guide covers the basics of logging messages.

## Log Levels

LogLayer supports six standard log levels, each with its own method:

- `info()` - For general information messages
- `warn()` - For warning messages
- `error()` - For error messages
- `debug()` - For debug information
- `trace()` - For detailed debugging information
- `fatal()` - For critical errors that require immediate attention

::: info Unsupported Log Levels
Some logging libraries may not support all levels. In such cases:

- `trace` is mapped to `debug`
- `fatal` is mapped to `error`
:::

## Basic Message Logging

The simplest way to log a message is to use one of the log level methods:

```typescript
// Basic info message
log.info('User logged in successfully')

// Warning message
log.warn('API rate limit approaching')

// Error message
log.error('Failed to connect to database')

// Debug message
log.debug('Processing request payload')

// Trace message (detailed debugging)
log.trace('Entering authentication function')

// Fatal message (critical errors)
log.fatal('System out of memory')
```

## Message Parameters

All log methods accept multiple parameters, which can be strings, booleans, numbers, null, or undefined:

```typescript
// Multiple parameters
log.info('User', 123, 'logged in')

// With string formatting
log.info('User %s logged in from %s', 'john', 'localhost')
```

::: tip sprintf-style formatting
The logging library you use may or may not support sprintf-style string formatting.
If it does not, you can use the [sprintf plugin](/plugins/sprintf) to enable support.
:::

## Message Prefixing

You can add a prefix to all log messages either through configuration or using the `withPrefix` method:

```typescript
// Via configuration
const log = new LogLayer({
  prefix: '[MyApp]',
  transport: new ConsoleTransport({
    logger: console
  })
})

// Via method
const prefixedLogger = log.withPrefix('[MyApp]')

// Output: "[MyApp] User logged in"
prefixedLogger.info('User logged in')
```

## Enabling/Disabling Logging

You can control whether logs are output using these methods:

```typescript
import type { LogLevel } from 'loglayer'

// Disable all logging
log.disableLogging()

// Enable logging again
log.enableLogging()

// Enable or disable specific log levels individually
log.enableIndividualLevel(LogLevel.debug)  // Enable only debug logs
log.disableIndividualLevel(LogLevel.debug) // Disable only debug logs

// Enable or disable log levels following the conventional log level hierarchy
log.setLevel(LogLevel.warn)  // Enable warn, error, and fatal (disable info, debug, trace)
```

::: info Transport log levels
Be aware that transports may have their own log level settings.
For example, if LogLayer is set to `debug` but the transport is set to `error`, the transport will only handle error and fatal messages.
:::

### Log Level Hierarchy

Log levels follow a hierarchy:
- `fatal (10)` > `error (20)` > `warn (30)` > `info (40)` > `debug (50)` > `trace (60)`

When using `setLevel()`, all levels below it are also enabled. 

For example, if you set the log level to `warn`:

- `warn`, `error`, and `fatal` messages will be logged
- `info`, `debug`, and `trace` messages will be ignored.

You can also ignore the hierarchy by using `enableIndividualLevel()` and `disableIndividualLevel()` methods to enable or disable specific log levels.

## Checking if a Log Level is Enabled

You can check if a specific log level is enabled using the `isLevelEnabled` method:

```typescript
if (log.isLevelEnabled(LogLevel.debug)) {
  log.debug('Debugging is enabled')
} else {
  log.info('Debugging is disabled')
}
```

## Raw Logging

The `raw(logEntry: RawLogEntry)` method allows you to bypass the normal LogLayer API and directly specify all aspects of a log entry. This is useful for scenarios where you need to log structured data that doesn't fit the standard LogLayer patterns, or when integrating with external logging systems that provide pre-formatted log entries.

The raw entry will still go through all LogLayer processing like the log level methods.

```typescript
import { LogLevel } from 'loglayer'

// Basic raw logging with just a message
log.raw({
  logLevel: LogLevel.info,
  messages: ['User action completed', { userId: 123 }]
})
```

### Raw Logging Parameters

| Parameter | Type | Required | Description                               |
|-----------|------|----------|-------------------------------------------|
| `logLevel` | `LogLevelType` | Yes | The log level for this entry              |
| `messages` | `MessageDataType[]` | No | Array of message parameters               |
| `metadata` | `Record<string, any>` | No | Additional metadata to include            |
| `error` | `any` | No | Error object to include                   |
| `context` | `Record<string, any>` | No | Context data to include (see notes below) |

### Context Behavior

When using the `context` parameter in raw logging, the behavior depends on whether you provide the `context` parameter or not. 

- If you provide a `context` in the raw entry, that context data will be used instead of the context manager for that specific log entry. 
- If you do not provide a `context`, the context manager data will be used (like normal logging).
- Passing an empty object `{}` as `context` will result in no context data being included for that log entry.

### Examples

```typescript
import { LogLayer, ConsoleTransport, LogLevel } from 'loglayer'

const log = new LogLayer({
  transport: new ConsoleTransport({
    logger: console,
    messageField: 'msg'
  }),
  // Configure custom field names for better organization
  contextFieldName: 'ctx',
  metadataFieldName: 'meta',
  errorFieldName: 'err'
})

// Set some stored context
log.withContext({ userId: 123, sessionId: 'abc' })

// This will use the stored context
log.raw({
  logLevel: LogLevel.info,
  messages: ['User action']
})
// Output: { "level": "info", "msg": "User action", "ctx": { "userId": 123, "sessionId": "abc" } }

// This will override the stored context for this entry only
log.raw({
  logLevel: LogLevel.info,
  messages: ['Admin action'],
  context: { adminId: 456, action: 'override' }
})
// Output: { "level": "info", "msg": "Admin action", "ctx": { "adminId": 456, "action": "override" } }

// This will use the stored context again (userId: 123, sessionId: 'abc')
log.raw({
  logLevel: LogLevel.info,
  messages: ['Another user action']
})
// Output: { "level": "info", "msg": "Another user action", "ctx": { "userId": 123, "sessionId": "abc" } }

// This will override with empty context, resulting in no context data
log.raw({
  logLevel: LogLevel.info,
  messages: ['System action'],
  context: {} // Empty context overrides stored context
})
// Output: { "level": "info", "msg": "System action" }

// Example with metadata and error
log.raw({
  logLevel: LogLevel.error,
  messages: ['Database operation failed'],
  metadata: { operation: 'insert', table: 'users' },
  error: new Error('Connection timeout'),
  context: { requestId: 'req-789' }
})
// Output: { "level": "error", "msg": "Database operation failed", "ctx": { "requestId": "req-789" }, "meta": { "operation": "insert", "table": "users" }, "err": { "type": "Error", "message": "Connection timeout", "stack": "Error: Connection timeout\n    at ..." } }
```
