---
title: Mixins
description: Learn how to create and use mixins with LogLayer
---

# Mixins

LogLayer's mixin system allows you to extend the `LogLayer` and `LogBuilder` prototypes with custom methods and functionality. Unlike plugins (which intercept and modify log processing) or transports (which send logs to destinations), mixins add new methods directly to the LogLayer API.

Mixins are useful when you want to:
- Add domain-specific methods to LogLayer (e.g., metrics, tracing)
- Integrate third-party libraries directly into the logging API
- Extend LogLayer with capabilities beyond logging

<!--@include: ./_partials/mixin-list.md-->

## Using Mixins

Mixins must be registered **before** creating LogLayer instances. You can register a single mixin or multiple mixins at once:

```typescript
import { LogLayer, useLogLayerMixin, ConsoleTransport } from 'loglayer';
import { hotshotsMixin } from '@loglayer/mixin-hot-shots';
import { StatsD } from 'hot-shots';

// Create and configure your third-party library
const statsd = new StatsD({
  host: 'localhost',
  port: 8125
});

// Register a single mixin (must be before creating LogLayer instances)
useLogLayerMixin(hotshotsMixin(statsd));

// Or register multiple mixins at once
useLogLayerMixin([
  hotshotsMixin(statsd),
  // otherMixin(),
]);

// Now create LogLayer instances with the mixin functionality
const log = new LogLayer({
  transport: new ConsoleTransport({
    logger: console
  })
});

// Use the mixin methods through the stats property
log.stats.increment('request.count').send();
log.stats.timing('request.duration', 150).send();
```

### TypeScript Interface Support

<!--@include: ./_partials/using-mixins-with-iloglayer.md-->

## Using Multiple Mixins Together

Multiple mixins work seamlessly through TypeScript's declaration merging. When you augment the same module multiple times, TypeScript automatically combines all the interface extensions.

### How Declaration Merging Works

Each mixin augments both the `@loglayer/shared` and `loglayer` modules independently. For illustration, here's how multiple mixins augment `@loglayer/shared`:

```typescript
// Mixin 1: Metrics
declare module '@loglayer/shared' {
  interface ILogLayer<This> extends IMetricsMixin<This> {}
}

// Mixin 2: Tracing
declare module '@loglayer/shared' {
  interface ILogLayer<This> extends ITracingMixin<This> {}
}

// Mixin 3: Hot-Shots
declare module '@loglayer/shared' {
  interface ILogLayer<This> extends IHotShotsMixin<This> {}
}
```

TypeScript merges all augmentations, so `ILogLayer<This>` effectively becomes:

```typescript
interface ILogLayer<This> extends
  IMetricsMixin<This>,
  ITracingMixin<This>,
  IHotShotsMixin<This>
{
  // ... original ILogLayer methods
}
```

Note: Each mixin also augments the `loglayer` module for runtime prototype augmentation (not shown here for brevity). Both augmentations are required for each mixin.

### Using Multiple Mixins

```typescript
import { useLogLayerMixin, LogLayer } from 'loglayer';
import type { ILogLayer } from 'loglayer';
import { metricsMixin } from '@your-package/mixin-metrics';
import { tracingMixin } from '@your-package/mixin-tracing';
import { hotShotsMixin } from '@loglayer/mixin-hot-shots';

// Register all mixins
useLogLayerMixin(metricsMixin());
useLogLayerMixin(tracingMixin());
useLogLayerMixin(hotShotsMixin({ client }));

const logger: ILogLayer = new LogLayer({ transport: ... });

// All mixin methods are available and preserved through chaining
logger
  .withContext({ userId: 123 })        // ILogLayer method returns This
  .withTraceId('trace-123')            // Tracing mixin method
  .withSpanId('span-456')              // Tracing mixin method
  .recordMetric('requests', 1)         // Metrics mixin method
  .stats.increment('api.calls')        // Hot-Shots mixin property
  .send();
```

### Key Points About Multiple Mixins

1. **Order Independence**: The order you register mixins doesn't affect type availability. All augmentations are merged at compile time.

2. **Type Preservation**: The generic `This` parameter flows through all mixin methods, preserving types across the entire chain.

3. **Works on Both Interfaces**: If mixins augment both `ILogLayer` and `ILogBuilder`, all methods remain available when transitioning between them:

```typescript
logger
  .withMetadata({ foo: 'bar' })        // Transitions to ILogBuilder<any>
  .withTraceId('trace-123')            // Mixin method still available
  .recordMetric('requests', 1)         // Mixin method still available
  .info('Message');
```

4. **No Conflicts**: As long as mixin methods have unique names, they coexist peacefully. If two mixins define the same method name, TypeScript uses the last declaration (standard declaration merging behavior).

5. **Scalability**: The system scales to any number of mixins without requiring changes to the core library.

## Creating Mixins

To learn how to create your own mixins, see the [Creating Mixins](/mixins/creating-mixins) guide.

