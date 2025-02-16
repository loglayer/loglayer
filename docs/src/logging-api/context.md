---
title: Context Logging in LogLayer
description: Learn how to create logs with context data in LogLayer
---

# Logging with Context

Context allows you to add persistent data that will be included with every log message. This is particularly useful for adding request IDs, user information, or any other data that should be present across multiple log entries.

::: info
The output examples use `msg` as the message field. The name of this field may vary depending on the logging library you are using.
In the `console` logger, this field does not exist, and the message is printed directly.
:::

## Adding Context

Use the `withContext` method to add context data:

```typescript
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
  "msg": "Processing request",
  "requestId": "123",
  "userId": "user_456"
}
```

::: warning Clearing context
Passing an empty value (`null`, `undefined`, or an empty object) to `withContext` will *not* clear the context; it does nothing. Use the `clearContext()` method to remove all context data.
:::

## Structuring Context

### Using a Dedicated Context Field

You can configure LogLayer to place context data in a dedicated field:

```typescript
log.withContext({
  requestId: '123',
  userId: 'user_456'
}).info('Processing request')
```

This produces:
```json
{
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
})

log.withContext({ requestId: '123' })
   .withMetadata({ duration: 1500 })
   .info('Request completed')
```

This produces:
```json
{
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

### Clearing Context

You can clear context data:

```typescript
log.clearContext()
```

### Muting Context

You can temporarily disable context logging:

```typescript
// Via configuration
const log = new LogLayer({
  muteContext: true,
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
