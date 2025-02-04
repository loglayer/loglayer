---
title: Plugins
description: Learn how to create and use plugins with LogLayer
---

# Plugins

LogLayer's plugin system allows you to extend and modify logging behavior at various points in the log lifecycle. Plugins can modify data and messages before they're sent to the logging library, control whether logs should be sent, and intercept metadata calls.

<!--@include: ./_partials/plugin-list.md-->

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
      // id is optional
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
    onBeforeDataOut(params) {
        // a simple plugin that does something
        return params.data
    }
}])
```

### Enabling/Disabling Plugins

Plugins can be enabled or disabled at runtime using their ID (if defined):

```typescript
// Disable a plugin
log.disablePlugin('sensitive-data-filter')

// Enable a plugin
log.enablePlugin('sensitive-data-filter')
```

### Removing Plugins

Remove a plugin using its ID (if defined):

```typescript
log.removePlugin('sensitive-data-filter')
```

### Replacing All Plugins

Replace all existing plugins with new ones:

```typescript
log.withFreshPlugins([
  timestampPlugin(),
  {
    onBeforeDataOut(params) {
      // do something
      return params.data
    }
  }
])
```

When used with child loggers, this only affects the current logger instance and does not modify the parent's plugins.

::: warning Potential Performance Impact
Replacing plugins at runtime may have a performance impact if you are frequently creating new plugins.
It is recommended to re-use the same plugin instance(s) where possible.
:::
