# Migrating from 4.x to 5.x

## Breaking Changes

### 1. Transport System

The most significant change in 5.x is the introduction of a new transport system. Instead of specifying a logger type and instance directly, you now need to use transport-specific packages:

```typescript
// 4.x
const log = new LogLayer({
  logger: {
    instance: console,
    type: LoggerType.CONSOLE
  }
})

// 5.x
import { ConsoleTransport } from 'loglayer'

const log = new LogLayer({
  transport: new ConsoleTransport({
    logger: console
  })
})
```

You can find the full list of transports in the [Transport](https://loglayer.github.io/docs/transports) documentation.

### 2. Configuration Changes

Several configuration options have been renamed or restructured:

```typescript
// 4.x
const log = new LogLayer({
  error: {
    serializer: mySerializer,
    fieldName: 'err'
  },
  context: {
    fieldName: 'context'
  },
  metadata: {
    fieldName: 'metadata'
  }
})

// 5.x
const log = new LogLayer({
  errorSerializer: mySerializer,
  errorFieldName: 'err',
  contextFieldName: 'context',
  metadataFieldName: 'metadata',
  errorFieldInMetadata: false // New option - defaults to false to match 4.x behavior
})
```

Here's a complete mapping of configuration options from 4.x to 5.x:

| 4.x Config | 5.x Config | Notes |
|------------|------------|-------|
| `logger.instance` | `transport` | Now uses transport classes instead of direct logger instances |
| `logger.type` | `transport` | Logger type is determined by the transport class used |
| `error.serializer` | `errorSerializer` | Moved to root level |
| `error.fieldName` | `errorFieldName` | Moved to root level |
| `error.copyMsgOnOnlyError` | `copyMsgOnOnlyError` | Moved to root level |
| `context.fieldName` | `contextFieldName` | Moved to root level |
| `metadata.fieldName` | `metadataFieldName` | Moved to root level |
| `enabled` | `enabled` | Unchanged |
| `prefix` | `prefix` | Unchanged |
| `consoleDebug` | `consoleDebug` | Unchanged |
| `muteContext` | `muteContext` | Unchanged |
| `muteMetadata` | `muteMetadata` | Unchanged |
| `plugins` | `plugins` | Unchanged |
| N/A | `errorFieldInMetadata` | New in 5.x - controls error object placement |
