---
title: Error Handling in LogLayer
description: Learn how to pass errors to LogLayer for logging
---

# Error Handling

LogLayer provides robust error handling capabilities with flexible configuration options for how errors are logged and serialized.

## Basic Error Logging

### With a Message

The most common way to log an error is using the `withError` method along with a message:

```typescript
const error = new Error('Database connection failed')
log.withError(error).error('Failed to process request')
```

You can use any log level with error logging:
```typescript
// Log error with warning level
log.withError(error).warn('Database connection unstable')

// Log error with info level
log.withError(error).info('Retrying connection')
```

### Error-Only Logging

When you just want to log an error without an additional message:

```typescript
// Default log level is 'error'
log.errorOnly(new Error('Database connection failed'))

// With custom log level
log.errorOnly(new Error('Connection timeout'), { 
  logLevel: LogLevel.warn 
})
```

## Error Configuration

### Error Field Name

By default, errors are logged under the `err` field. You can customize this:

```typescript
const log = new LogLayer({
  errorFieldName: 'error', // Default is 'err'
})

log.errorOnly(new Error('test'))
// Output: { "error": { "message": "test", "stack": "..." } }
```

### Error Serialization

Some logging libraries don't handle Error objects well. You can provide a custom error serializer:

```typescript
const log = new LogLayer({
  errorSerializer: (err) => ({
    message: err.message,
    stack: err.stack,
    code: err.code
  }),
})
```

For libraries like `roarr` that require error serialization, you can use a package like `serialize-error`:

```typescript
import { serializeError } from 'serialize-error'

const log = new LogLayer({
  errorSerializer: serializeError,
  transport: new RoarrTransport({
    logger: roarr
  })
})
```

::: tip Use serialize-error
We strongly recommend the use of `serialize-error` for error serialization.
:::

### Error Message Copying

You can configure LogLayer to automatically copy the error's message as the log message:

```typescript
const log = new LogLayer({
  copyMsgOnOnlyError: true,
})

// Will include error.message as the log message
log.errorOnly(new Error('Connection failed'))
```

You can override this behavior per call:
```typescript
// Disable message copying for this call
log.errorOnly(new Error('test'), { copyMsg: false })

// Enable message copying for this call even if disabled globally
log.errorOnly(new Error('test'), { copyMsg: true })
```

### Error in Metadata

You can configure errors to be included in the metadata field instead of at the root level:

```typescript
const log = new LogLayer({
  errorFieldInMetadata: true,
  metadataFieldName: 'metadata',
})

log.errorOnly(new Error('test'))
// Output: { "metadata": { "err": { "message": "test", "stack": "..." } } }
```

## Combining Errors with Other Data

### With Metadata

You can combine errors with metadata:

```typescript
log.withError(new Error('Query failed'))
   .withMetadata({
     query: 'SELECT * FROM users',
     duration: 1500
   })
   .error('Database error')
```

### With Context

Errors can be combined with context data:

```typescript
log.withContext({ requestId: '123' })
   .withError(new Error('Not found'))
   .error('Resource not found')
```
