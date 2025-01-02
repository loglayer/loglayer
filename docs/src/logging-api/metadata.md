# Logging with Metadata

Metadata allows you to add structured data to your log messages. LogLayer provides several ways to include metadata in your logs.

## Adding Metadata to Messages

The most common way to add metadata is using the `withMetadata` method:

```typescript
log.withMetadata({ 
  userId: '123',
  action: 'login',
  browser: 'Chrome'
}).info('User logged in')
```

By default, this produces a flattened log entry:
```json
{
  "level": 30,
  "time": 1638138422796,
  "msg": "User logged in",
  "userId": "123",
  "action": "login",
  "browser": "Chrome"
}
```

## Logging Metadata Only

Sometimes you want to log metadata without a message. Use `metadataOnly` for this:

```typescript
// Default log level is 'info'
log.metadataOnly({
  status: 'healthy',
  memory: '512MB',
  cpu: '45%'
})

// Or specify a different log level
log.metadataOnly({
  status: 'warning',
  memory: '1024MB',
  cpu: '90%'
}, LogLevel.warn)
```

## Structuring Metadata

By default, metadata is flattened into the root of the log object. You can change this by configuring a dedicated metadata field:

```typescript
const log = new LogLayer({
  metadataFieldName: 'metadata',
  transport: new ConsoleTransport({
    logger: console
  })
})

log.withMetadata({
  userId: '123',
  action: 'login'
}).info('User logged in')
```

This produces:
```json
{
  "level": 30,
  "time": 1638138422796,
  "msg": "User logged in",
  "metadata": {
    "userId": "123",
    "action": "login"
  }
}
```

## Combining Metadata with Other Data

### With Context

Metadata can be combined with context data:

```typescript
log.withContext({ requestId: 'abc' })
   .withMetadata({ userId: '123' })
   .info('Processing request')
```

If using field names:
```json
{
  "level": 30,
  "time": 1638138422796,
  "msg": "Processing request",
  "context": {
    "requestId": "abc"
  },
  "metadata": {
    "userId": "123"
  }
}
```

### With Errors

Metadata can be combined with error logging:

```typescript
log.withError(new Error('Database connection failed'))
   .withMetadata({ 
     dbHost: 'localhost',
     retryCount: 3
   })
   .error('Failed to connect')
```

## Controlling Metadata Output

### Muting Metadata

You can temporarily disable metadata output:

```typescript
// Via configuration
const log = new LogLayer({
  muteMetadata: true,
  transport: new ConsoleTransport({
    logger: console
  })
})

// Or via methods
log.muteMetadata()   // Disable metadata
log.unMuteMetadata() // Re-enable metadata
```
