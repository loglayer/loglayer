---
title: LogLayer Cheat Sheet
description: A quick reference guide covering the most common LogLayer APIs and patterns
---

# Cheat Sheet

A quick reference for the most commonly used LogLayer APIs.

## Setup

```typescript
import { LogLayer, ConsoleTransport } from 'loglayer'

const log = new LogLayer({
  transport: new ConsoleTransport({
    logger: console
  })
})
```

See [Getting Started](/getting-started) for full setup instructions and [Transports](/transports/) for all available transports.

## Log Messages

```typescript
log.info('User logged in')
log.warn('Disk space low')
log.error('Connection failed')
log.debug('Cache hit for key abc')
log.trace('Entering function parse()')
log.fatal('System out of memory')

// Multiple parameters
log.info('User', userId, 'performed action', action)
```

See [Basic Logging](/logging-api/basic-logging) for more details.

## Metadata (Per-Log Data)

Metadata is attached to a **single** log entry only.

```typescript
log.withMetadata({ userId: '123', duration: 42 }).info('Request handled')
```

```json
{ "msg": "Request handled", "userId": "123", "duration": 42 }
```

Log metadata without a message:

```typescript
log.metadataOnly({ status: 'healthy', uptime: 3600 })
```

See [Metadata](/logging-api/metadata) for dedicated fields and muting.

## Context (Persistent Data)

Context persists across **all** subsequent log entries.

```typescript
log.withContext({ requestId: 'abc-123', region: 'us-east' })

log.info('Starting')   // includes requestId + region
log.info('Done')        // still includes requestId + region
```

```json
{ "msg": "Starting", "requestId": "abc-123", "region": "us-east" }
```

Manage context:

```typescript
log.getContext()                    // get current context
log.clearContext()                  // clear all context
log.clearContext('requestId')       // clear one key
log.clearContext(['key1', 'key2'])  // clear specific keys
```

See [Context](/logging-api/context) for dedicated fields and context managers.

## Error Handling

```typescript
// Error with a message
log.withError(new Error('timeout')).error('DB query failed')

// Error-only (default level: error)
log.errorOnly(new Error('timeout'))

// Error-only with custom level
log.errorOnly(new Error('timeout'), { logLevel: LogLevel.warn })

// Combine error + metadata
log
  .withMetadata({ query: 'SELECT ...', attempt: 3 })
  .withError(new Error('timeout'))
  .error('DB query failed')
```

See [Error Handling](/logging-api/error-handling) for serialization and configuration options.

## Chaining

```typescript
log
  .withContext({ requestId: 'abc' })    // persists
  .withMetadata({ duration: 150 })      // single entry
  .withError(new Error('fail'))         // single entry
  .error('Request failed')
```

## Child Loggers

```typescript
const childLog = log.child()

// Child inherits config, context, and plugins from parent
childLog.withContext({ module: 'auth' })
childLog.info('Token verified')  // has parent context + module
```

See [Child Loggers](/logging-api/child-loggers) for inheritance behavior and [Context Managers](/context-managers/) for controlling context propagation.

## Log Levels

```typescript
import { LogLevel } from 'loglayer'

// Set minimum level (all levels >= warn are enabled)
log.setLevel(LogLevel.warn)

// Enable/disable individual levels
log.enableIndividualLevel(LogLevel.debug)
log.disableIndividualLevel(LogLevel.trace)

// Check if a level is enabled
log.isLevelEnabled(LogLevel.debug)  // true/false

// Enable/disable all logging
log.disableLogging()
log.enableLogging()
```

**Level hierarchy:** `trace` (10) &lt; `debug` (20) &lt; `info` (30) &lt; `warn` (40) &lt; `error` (50) &lt; `fatal` (60)

See [Adjusting Log Levels](/logging-api/adjusting-log-levels) and [Log Level Managers](/log-level-managers/) for parent-child propagation.

## Message Prefixing

```typescript
// Via config
const log = new LogLayer({
  prefix: '[MyApp]',
  transport: new ConsoleTransport({ logger: console })
})

// Via method (returns a child logger)
const prefixed = log.withPrefix('[Auth]')
prefixed.info('Login successful')
// Output: "[Auth] Login successful"
```

## Multiple Transports

```typescript
import { PinoTransport } from '@loglayer/transport-pino'
import { DatadogBrowserLogsTransport } from '@loglayer/transport-datadog-browser-logs'

const log = new LogLayer({
  transport: [
    new PinoTransport({ logger: pino(), id: 'pino' }),
    new DatadogBrowserLogsTransport({ logger: datadogLogs, id: 'datadog' })
  ]
})
```

See [Multiple Transports](/transports/multiple-transports) for more details.

## Transport Management

```typescript
// Add a transport
log.addTransport(new PinoTransport({ logger: pino(), id: 'pino' }))

// Remove a transport by ID
log.removeTransport('pino')

// Replace all transports
log.withFreshTransports(new ConsoleTransport({ logger: console }))

// Get underlying logger instance
const pinoInstance = log.getLoggerInstance<P.Pino>('pino')
```

See [Transport Management](/logging-api/transport-management) for full details.

## Plugin Management

```typescript
log.addPlugins([myPlugin])
log.enablePlugin('my-plugin-id')
log.disablePlugin('my-plugin-id')
log.removePlugin('my-plugin-id')
log.withFreshPlugins([newPlugin])
```

See [Plugins](/plugins/) for available plugins and how to create your own.

## Configuration Options

```typescript
const log = new LogLayer({
  // Required
  transport: new ConsoleTransport({ logger: console }),

  // Message
  prefix: '[MyApp]',

  // Control
  enabled: true,

  // Error handling
  errorFieldName: 'err',                      // default: 'err'
  errorSerializer: (err) => ({ message: err.message, stack: err.stack }),
  copyMsgOnOnlyError: false,                   // copy error.message on errorOnly()
  errorFieldInMetadata: false,                 // nest error inside metadata field

  // Field naming (places data in dedicated fields instead of root)
  contextFieldName: 'context',
  metadataFieldName: 'metadata',

  // Muting
  muteContext: false,
  muteMetadata: false,

  // Plugins
  plugins: [myPlugin],
})
```

See [Configuration](/configuration) for full details on all options.

## Muting

```typescript
// Context
log.muteContext()
log.unMuteContext()

// Metadata
log.muteMetadata()
log.unMuteMetadata()
```

## Testing

```typescript
import { MockLogLayer } from 'loglayer'

// Drop-in replacement — all methods are no-ops
const log = new MockLogLayer()
```

See [No-op / Mocking](/logging-api/unit-testing) for advanced mock patterns with spies.

## Raw Logging

Full control over all log parameters:

```typescript
import { LogLevel } from 'loglayer'

log.raw({
  logLevel: LogLevel.error,
  messages: ['Operation failed'],
  metadata: { table: 'users' },
  error: new Error('timeout'),
  context: { requestId: 'req-1' }    // overrides stored context for this entry
})
```

See [Basic Logging](/logging-api/basic-logging#raw-logging) for context behavior and more examples.

## Quick Reference Table

| What | Method | Scope |
|------|--------|-------|
| Log a message | `log.info('msg')` | Single entry |
| Attach metadata | `log.withMetadata({...}).info('msg')` | Single entry |
| Attach an error | `log.withError(err).error('msg')` | Single entry |
| Set context | `log.withContext({...})` | Persistent |
| Create child | `log.child()` | New instance |
| Set log level | `log.setLevel(LogLevel.warn)` | Persistent |
| Add prefix | `log.withPrefix('[Tag]')` | New instance |
| Log error only | `log.errorOnly(err)` | Single entry |
| Log metadata only | `log.metadataOnly({...})` | Single entry |
| Mock for tests | `new MockLogLayer()` | - |
