# Child Loggers

Child loggers allow you to create new logger instances that inherit configuration, context, and plugins from their parent logger. This is particularly useful for creating loggers with additional context for specific components or modules while maintaining the base configuration.

## Creating Child Loggers

Use the `child()` method to create a child logger:

```typescript
const parentLog = new LogLayer({
  transport: new ConsoleTransport({
    logger: console
  })
})

const childLog = parentLog.child()
```

## Inheritance Behavior

Child loggers inherit:
1. Configuration from the parent
2. Context data (as a shallow copy)
3. Plugins

### Configuration Inheritance

All configuration options are inherited from the parent:

```typescript
const parentLog = new LogLayer({
  transport: new ConsoleTransport({
    logger: console
  }),
  contextFieldName: 'context',
  metadataFieldName: 'metadata',
  errorFieldName: 'error'
})

// Child inherits all configuration
const childLog = parentLog.child()
```

### Context Inheritance

Context data is shallow copied from the parent:

```typescript
const parentLog = new LogLayer({}).withContext({
  app: 'myapp',
  version: '1.0.0'
})

// Child inherits parent's context
const childLog = parentLog.child()
childLog.info('Hello')
// Output includes: { app: 'myapp', version: '1.0.0' }

// Add additional context to child
childLog.withContext({
  module: 'users'
})
childLog.info('User created')
// Output includes: { app: 'myapp', version: '1.0.0', module: 'users' }

// Parent's context remains unchanged
parentLog.info('Parent log')
// Output includes: { app: 'myapp', version: '1.0.0' }
```
