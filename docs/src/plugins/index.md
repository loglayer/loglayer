---
title: Plugins
description: Learn how to create and use plugins with LogLayer
---

# Plugins

LogLayer's plugin system allows you to extend and modify logging behavior at various points in the log lifecycle. Plugins can modify data and messages before they're sent to the logging library, control whether logs should be sent, and intercept metadata calls.

## Plugin Management

### Adding Plugins

You can add plugins when creating the LogLayer instance:

```typescript
const log = new LogLayer({
  transport: new ConsoleTransport({
    logger: console
  }),
  plugins: [
    timestampPlugin(),
    {
      id: 'sensitive-data-filter',
      onBeforeDataOut(params) {
        // a simple plugin that does something
        return params.data
      }
    }
  ]
})
```

Or add them later:

```typescript
log.addPlugins([timestampPlugin()])
log.addPlugins([{
    id: 'sensitive-data-filter',
    onBeforeDataOut(params) {
        // a simple plugin that does something
        return params.data
    }
}])
```

### Enabling/Disabling Plugins

Plugins can be enabled or disabled at runtime using their ID:

```typescript
// Disable a plugin
log.disablePlugin('sensitive-data-filter')

// Enable a plugin
log.enablePlugin('sensitive-data-filter')
```

### Removing Plugins

Remove a plugin using its ID:

```typescript
log.removePlugin('sensitive-data-filter')
```
