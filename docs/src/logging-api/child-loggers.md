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

Context inheritance behavior depends on the [Context Manager](/context-managers/) being used. By default, the [Default Context Manager](/context-managers/default) is used.

<!--@include: ../context-managers/_partials/default-context-manager-behavior.md-->
