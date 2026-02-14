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
4. [Groups](/logging-api/groups) (shared reference — runtime changes propagate)

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

### Group Inheritance

When [groups](/logging-api/groups) are configured, child loggers share the parent's group configuration and active groups filter **by reference**. This means runtime changes (such as `addGroup()`, `removeGroup()`, `setGroupLevel()`, or `setActiveGroups()`) on either parent or child affect both:

```typescript
const parentLog = new LogLayer({
  transport: [
    new ConsoleTransport({ id: 'console', logger: console }),
    new DatadogTransport({ id: 'datadog', logger: datadog }),
  ],
  groups: {
    database: { transports: ['datadog'], level: 'error' },
  },
})

const childLog = parentLog.child()

// Parent changes the group level — child sees it too
parentLog.setGroupLevel('database', 'debug')
childLog.withGroup('database').debug('query ran')  // sent (debug >= debug)
```

However, **persistent group tags** (assigned via `withGroup()` on an instance) are copied independently. A child created with `withGroup()` does not affect the parent's tags:

```typescript
const dbLogger = parentLog.withGroup('database')
dbLogger.error('Pool exhausted')   // tagged with 'database'
parentLog.error('Something else')  // not tagged with any group
```
