---
title: Logging Basics With LogLayer
description: Learn how to log messages at different severity levels with LogLayer
---

# Basic Logging

LogLayer provides a simple and consistent API for logging messages at different severity levels. This guide covers the basics of logging messages.

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

## Tagged Template Syntax

All log methods support native JavaScript tagged template syntax. This allows you to write natural template strings without parentheses:

```typescript
const userId = '123'
const action = 'login'

// Basic tagged template
log.info`User ${userId} logged in`

// Multiple interpolations
log.info`User ${userId} performed ${action}`

// Works with all log levels
log.warn`Request ${requestId} timed out`
log.error`Failed: ${error.message}`
log.debug`Cache hit for ${cacheKey}`
```

### With Fluent API

Tagged templates work seamlessly with LogLayer's fluent API:

```typescript
// With context
log.withContext({ userId, requestId })
  .info`User ${userId} requested ${requestId}`

// With metadata
log.withMetadata({ duration: 150, status: 200 })
  .info`Request completed in ${duration}ms with status ${status}`

// With error
log.withError(error)
  .error`Operation failed: ${error.message}`

// Full chain
log
  .withContext({ userId, requestId })
  .withMetadata({ duration: 150 })
  .withError(error)
  .warn`Request ${requestId} timed out after ${duration}ms`
```

### Behavior

- **Immediate value capture**: Values are captured when the template is evaluated (standard tagged template behavior)
- **String coercion**: All interpolated values use `String()` for coercion
- **Object handling**: Objects are stringified to `"[object Object]"` — this is intentional. Use `withMetadata()` or `withContext()` for structured data

```typescript
// null becomes "null"
log.info`User ${null} logged in`  // "User null logged in"

// undefined becomes "undefined"
log.info`Value: ${undefined}`     // "Value: undefined"

// Pure interpolations work too
log.info`${userId}`               // "123"

// For structured objects, use metadata (not template interpolations)
log.withMetadata({ user }).info`User logged in`
```

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
