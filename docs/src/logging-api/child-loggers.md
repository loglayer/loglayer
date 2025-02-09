---
title: Child Logging in LogLayer
description: Learn how to create child loggers in LogLayer
---

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
2. Context data (as a shallow copy by default, or shared reference if configured)
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

By default, context data is shallow copied from the parent:

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

### Linked Context

You can configure child loggers to link to their parent's context using the `linkParentContext` option. When enabled, changes to the context in either the parent or child logger will affect both loggers:

```typescript
const parentLog = new LogLayer({
  transport: new ConsoleTransport({
    logger: console
  }),
  linkParentContext: true
}).withContext({
  app: 'myapp',
  version: '1.0.0'
})

// Child links to parent's context
const childLog = parentLog.child()

// Add context to child
childLog.withContext({
  module: 'users'
})

childLog.info('User created')
// Output includes: { app: 'myapp', version: '1.0.0', module: 'users' }

// Parent's context is also updated
parentLog.info('Parent log')
// Output includes: { app: 'myapp', version: '1.0.0', module: 'users' }

// Changes in parent affect child too
parentLog.withContext({
  environment: 'production'
})

childLog.info('Child log')
// Output includes: { app: 'myapp', version: '1.0.0', module: 'users', environment: 'production' }
```

This is useful when you want to maintain a single source of truth for context across multiple logger instances. For example, you might want to update request-scoped context data that should be reflected in all loggers within that request.
