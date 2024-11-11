# Logging with Context

Context allows you to add persistent data that will be included with every log message. This is particularly useful for adding request IDs, user information, or any other data that should be present across multiple log entries.

## Adding Context

Use the `withContext` method to add context data:

```typescript
const log = new LogLayer({
  transport: new ConsoleTransport({
    logger: console
  })
})

log.withContext({
  requestId: '123',
  userId: 'user_456'
})

// Context will be included in all subsequent log messages
log.info('Processing request')
log.warn('User quota exceeded')
```

By default, context data is flattened into the root of the log object:
```json
{
  "level": 30,
  "time": 1638146872750,
  "msg": "Processing request",
  "requestId": "123",
  "userId": "user_456"
}
```

## Structuring Context

### Using a Dedicated Context Field

You can configure LogLayer to place context data in a dedicated field:

```typescript
const log = new LogLayer({
  contextFieldName: 'context',
  transport: new ConsoleTransport({
    logger: console
  })
})

log.withContext({
  requestId: '123',
  userId: 'user_456'
}).info('Processing request')
```

This produces:
```json
{
  "level": 30,
  "time": 1638146872750,
  "msg": "Processing request",
  "context": {
    "requestId": "123",
    "userId": "user_456"
  }
}
```

### Combining Context and Metadata Fields

If you set the same field name for both context and metadata, they will be merged:

```typescript
const log = new LogLayer({
  contextFieldName: 'data',
  metadataFieldName: 'data',
  transport: new ConsoleTransport({
    logger: console
  })
})

log.withContext({ requestId: '123' })
   .withMetadata({ duration: 1500 })
   .info('Request completed')
```

This produces:
```json
{
  "level": 30,
  "time": 1638146872750,
  "msg": "Request completed",
  "data": {
    "requestId": "123",
    "duration": 1500
  }
}
```

## Managing Context

### Getting Current Context

You can retrieve the current context data:

```typescript
log.withContext({ requestId: '123' })

const context = log.getContext()
// Returns: { requestId: '123' }
```

### Child Loggers

You can create a child logger that inherits the parent's context:

```typescript
const parentLog = new LogLayer({
  transport: new ConsoleTransport({
    logger: console
  })
}).withContext({ app: 'myapp' })

const childLog = parentLog.child()
  .withContext({ module: 'users' })

childLog.info('User created')
// Will include both { app: 'myapp', module: 'users' }
```

Note that the context is shallow copied when creating a child logger.

### Muting Context

You can temporarily disable context logging:

```typescript
// Via configuration
const log = new LogLayer({
  muteContext: true,
  transport: new ConsoleTransport({
    logger: console
  })
})

// Or via methods
log.muteContext()   // Disable context
log.unMuteContext() // Re-enable context
```

This is useful for development or troubleshooting when you want to reduce log verbosity.

## Combining Context with Other Features

### With Errors

Context data is included when logging errors:

```typescript
log.withContext({ requestId: '123' })
   .withError(new Error('Not found'))
   .error('Failed to fetch user')
```

### With Metadata

Context can be combined with per-message metadata:

```typescript
log.withContext({ requestId: '123' })
   .withMetadata({ userId: 'user_456' })
   .info('User logged in')
```
