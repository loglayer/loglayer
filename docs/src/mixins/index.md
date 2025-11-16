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

## Creating Mixins

To learn how to create your own mixins, see the [Creating Mixins](/mixins/creating-mixins) guide.

