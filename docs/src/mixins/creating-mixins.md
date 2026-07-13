---
title: Creating LogLayer Mixins
description: Learn how to create custom mixins for LogLayer
---

# Creating Mixins

## Overview

According to [patterns.dev](https://www.patterns.dev/vanilla/mixin-pattern/), a mixin's sole purpose is to add functionality to objects or classes _without inheritance_.

In LogLayer, mixins allow you to extend the `LogLayer` or `LogBuilder` class prototypes with custom methods and functionality without having to extend the classes. Unlike plugins (which intercept and modify log processing) or transports (which send logs to destinations), mixins add new methods directly to the LogLayer API.

Mixins are useful when you want to:
- Add domain-specific methods to LogLayer (e.g., metrics, tracing)
- Integrate third-party libraries directly into the logging API
- Extend LogLayer with capabilities beyond logging (e.g., StatsD metrics)

_Mixin runtime functionality is provided directly by the `loglayer` package. Type declarations augment both `loglayer` (the concrete classes) and `@loglayer/shared` (the `ILogLayer` / `ILogBuilder` interfaces); the latter is already available transitively through `loglayer`, so no additional package needs to be installed._

## Anatomy of a Mixin in LogLayer

A mixin consists of several key components:

1. TypeScript type declarations for your new methods
2. The mixin implementation that augments the prototype of the class you want to add to and its corresponding mock
3. A registration function that users call to register the mixin
4. Optional plugins that work with the mixin to modify logging data

### TypeScript Type Declarations

All mixins must use TypeScript declaration merging to add type definitions for their methods. This requires augmenting **two** modules:

- **`loglayer`** — the concrete `LogLayer` / `MockLogLayer` (and `LogBuilder` / `MockLogBuilder`) classes.
- **`@loglayer/shared`** — the `ILogLayer` / `ILogBuilder` interfaces (these are *defined* in `@loglayer/shared` and only re-exported by `loglayer`).

Chainable methods (those that return the logger for further chaining) should return the polymorphic `this` type. `this` resolves to the concrete receiver at every step, so a single interface definition works for `LogLayer`, `MockLogLayer`, and the `ILogLayer<This>` returned by chained calls — no generic type parameter needed:

```typescript
// types.ts
export interface ICustomMixin {
  /**
   * Your method documentation
   */
  customMethod(param: string): this;
}

// Augment the concrete classes for runtime prototype augmentation
declare module 'loglayer' {
  interface LogLayer extends ICustomMixin {}
  interface MockLogLayer extends ICustomMixin {}
}

// Augment the interface where it lives (@loglayer/shared)
declare module '@loglayer/shared' {
  interface ILogLayer<This> extends ICustomMixin {}
}
```

**Module augmentation explanation:**

- The `loglayer` augmentation extends the concrete `LogLayer` and `MockLogLayer` classes. This is necessary because your mixin implementation adds methods to these class prototypes at runtime.
- The `@loglayer/shared` augmentation extends the `ILogLayer<This>` interface so that mixin methods are available on **every** instantiation of it — including the `ILogLayer<This>` returned by chained methods like `withContext()`, `child()`, and `withPrefix()`.

::: warning Augment `ILogLayer` in `@loglayer/shared`, not `loglayer`
`ILogLayer` is *defined* in `@loglayer/shared` and only re-exported by `loglayer`. If you put `interface ILogLayer<This>` inside `declare module 'loglayer'`, your methods will appear on a directly-typed `ILogLayer` value but **silently disappear** on the return type of chained calls such as `logger.child()` — because those return the `@loglayer/shared` interface, which never received the augmentation. Always augment `ILogLayer` / `ILogBuilder` under `declare module '@loglayer/shared'`.
:::

Returning `this` (instead of a generic `T`) also keeps chains of mixin methods stable: `logger.customMethod('a').customMethod('b')` stays fully typed, whereas a generic that resolves through `ILogLayer<This>` can collapse to `any`.

#### Augmenting ILogBuilder

Mixins can also augment `ILogBuilder` to add methods available during the builder phase (after calling `withMetadata()` or `withError()`):

```typescript
// types.ts
export interface ICustomBuilderMixin {
  customBuilderMethod(param: string): this;
}

// Augment the concrete builder classes
declare module 'loglayer' {
  interface LogBuilder extends ICustomBuilderMixin {}
  interface MockLogBuilder extends ICustomBuilderMixin {}
}

// Augment the ILogBuilder interface where it lives (@loglayer/shared)
declare module '@loglayer/shared' {
  interface ILogBuilder<This> extends ICustomBuilderMixin {}
}
```

Usage:

```typescript
logger
  .withMetadata({ foo: 'bar' })        // Returns ILogBuilder<any>
  .customBuilderMethod('test')         // Mixin method available on builder
  .withError(error)                    // Builder method
  .customBuilderMethod('test2')        // Still available through chaining
  .info('Message');
```

#### Augmenting Both ILogLayer and ILogBuilder

Many mixins need to work in both the logger and builder phases. Here's an example of a mixin that adds methods to both interfaces:

```typescript
// types.ts
export interface IPerfTimingMixin {
  withPerfStart(id: string): this;
  withPerfEnd(id: string): this;
}

// Augment the concrete classes for runtime prototype augmentation
declare module 'loglayer' {
  interface LogLayer extends IPerfTimingMixin {}
  interface LogBuilder extends IPerfTimingMixin {}
  interface MockLogLayer extends IPerfTimingMixin {}
  interface MockLogBuilder extends IPerfTimingMixin {}
}

// Augment the interfaces where they live (@loglayer/shared)
declare module '@loglayer/shared' {
  interface ILogLayer<This> extends IPerfTimingMixin {}
  interface ILogBuilder<This> extends IPerfTimingMixin {}
}
```

This allows the mixin methods to work in both phases:

```typescript
// Works on LogLayer
logger.withPerfStart('operation').info('Started');

// Also works on LogBuilder (after withMetadata/withError)
logger.withMetadata({ step: 1 })
  .withPerfStart('operation')
  .info('Started');
```

### Mixin Implementation

A mixin is an object that implements either `LogLayerMixin` or `LogBuilderMixin`:

```typescript
import type { LogLayerMixin, LogLayer, MockLogLayer } from 'loglayer';
import { LogLayerMixinAugmentType } from 'loglayer';

const customMixinImplementation: LogLayerMixin = {
  augmentationType: LogLayerMixinAugmentType.LogLayer,
  
  // Optional: Called when each LogLayer instance is constructed
  onConstruct: (instance: LogLayer, config: LogLayerConfig) => {
    // The LogLayer instance is passed as the first parameter
    // Initialize per-instance state here if needed
  },
  
  // Required: Augments the prototype with new methods
  augment: (prototype) => {
    // When assigning methods to the prototype, use regular functions (not arrow functions)
    // to preserve proper `this` context
    prototype.customMethod = function (this: LogLayer, param: string): LogLayer {
      // Your implementation
      return this; // Return this for method chaining
    };
  },
  
  // Required: Augments the MockLogLayer prototype with the same methods
  // This ensures mock classes have the same functionality for testing
  augmentMock: (prototype) => {
    // Implement the same methods as no-ops for the mock class
    prototype.customMethod = function (this: MockLogLayer, param: string): MockLogLayer {
      // Mock implementation - typically just returns this without side effects
      return this;
    };
  }
};
```

#### Mock Class Augmentation

All mixins must implement `augmentMock` because **most users will use `MockLogLayer` or `MockLogBuilder` in their unit tests**. Without it, mixin methods won't be available on mock classes, causing TypeScript errors and runtime failures.

The `augmentMock` implementation should be a no-op version with the same method signatures that returns `this` for chaining without performing any work:

```typescript
import type { ILogLayer } from 'loglayer';
import { describe, it, expect } from 'vitest';
import { MockLogLayer } from 'loglayer';

// Service class that uses mixin methods
class MyService {
  constructor(private log: ILogLayer) {}
  
  processRequest() {
    // Uses mixin method - works with both LogLayer and MockLogLayer
    this.log.customMethod('request').info('Processing request');
  }
}

describe('MyService', () => {
  it('should work with MockLogLayer', () => {
    // We don't want to print logs during testing, so use the
    // MockLogLayer instead of LogLayer
    const mockLog = new MockLogLayer();
    const service = new MyService(mockLog);
    // Without augmentMock, this would fail at compile time and runtime
    service.processRequest(); // MockLogLayer has customMethod thanks to augmentMock
  });
});
```

### Optional Plugins

Mixins can optionally include [plugins](/plugins/) that work alongside the mixin to modify logging data. This is useful when:

- You want to automatically enrich log data based on mixin state
- You need to transform or filter logs based on how mixin methods are used
- The mixin needs to interact with the logging pipeline

The key insight is that **plugins receive the LogLayer instance as a parameter**, allowing them to access any state or methods that your mixin has added to the LogLayer instance. This creates a powerful integration where mixin methods can set state, and plugins can automatically include that state in every log entry.

Here's a complete example showing how a mixin and plugin work together:

```typescript
import type { LogLayerPlugin, PluginBeforeDataOutParams, LogLayer } from 'loglayer';

// 1. Declare the mixin method that tracks request context
export interface IRequestTrackingMixin {
  /**
   * Sets the current request ID for correlation tracking
   */
  setRequestId(requestId: string): this;

  /**
   * Gets the current request ID
   */
  getRequestId(): string | undefined;
}

// Augment the concrete classes...
declare module 'loglayer' {
  interface LogLayer extends IRequestTrackingMixin {}
  interface MockLogLayer extends IRequestTrackingMixin {}
}

// ...and the ILogLayer interface where it lives (@loglayer/shared)
declare module '@loglayer/shared' {
  interface ILogLayer<This> extends IRequestTrackingMixin {}
}

// 2. Mixin implementation that stores request ID on each LogLayer instance
// Use a shared Symbol so both onConstruct and augment methods can access the same property
const REQUEST_ID_KEY = Symbol('requestId');

const requestTrackingMixinImpl: LogLayerMixin = {
  augmentationType: LogLayerMixinAugmentType.LogLayer,
  
  // Initialize per-instance state when LogLayer is constructed
  onConstruct: (instance: LogLayer) => {
    // Initialize the request ID storage on this instance
    (instance as any)[REQUEST_ID_KEY] = undefined;
  },
  
  augment: (prototype) => {
    prototype.setRequestId = function (this: LogLayer, requestId: string): LogLayer {
      // Store the request ID on this instance
      (this as any)[REQUEST_ID_KEY] = requestId;
      return this;
    };
    
    prototype.getRequestId = function (this: LogLayer): string | undefined {
      return (this as any)[REQUEST_ID_KEY];
    };
  },
  
  augmentMock: (prototype) => {
    prototype.setRequestId = function (this: MockLogLayer, requestId: string): MockLogLayer {
      return this; // No-op for mocks
    };
    
    prototype.getRequestId = function (this: MockLogLayer): string | undefined {
      return undefined; // No-op for mocks
    };
  }
};

// 3. Plugin that automatically adds request ID to every log entry
const requestIdPlugin: LogLayerPlugin = {
  onBeforeDataOut: (params: PluginBeforeDataOutParams, loglayer: LogLayer) => {
    // Access the mixin's state via the LogLayer instance
    const requestId = loglayer.getRequestId();
    
    // Automatically enrich all log entries with request ID if present
    if (requestId) {
      return {
        ...(params.data || {}),
        requestId: requestId
      };
    }
    
    // Return original data if no request ID is set
    return params.data;
  }
};

// 4. Registration function that includes both mixin and plugin
export function requestTrackingMixin(): LogLayerMixinRegistration {
  return {
    mixinsToAdd: [requestTrackingMixinImpl],
    pluginsToAdd: [requestIdPlugin] // Plugin automatically enriches logs
  };
}
```

**Usage example:**

```typescript
import { useLogLayerMixin, LogLayer, ConsoleTransport } from 'loglayer';
import type { ILogLayer } from 'loglayer';
import { requestTrackingMixin } from '@your-package/request-tracking';

// Register the mixin (includes the plugin automatically)
useLogLayerMixin(requestTrackingMixin());

// Create LogLayer instance
// ILogLayer automatically includes mixin methods through the generic parameter
const log: ILogLayer = new LogLayer({
  transport: new ConsoleTransport({ logger: console })
});

// Use the mixin method to set request context
log.setRequestId('req-123');

// All subsequent logs automatically include the request ID via the plugin
log.info('Processing user request');
// Output: { requestId: 'req-123', message: 'Processing user request', ... }

// Mixin methods are preserved through method chaining
log.withMetadata({ userId: 456 }).setRequestId('req-456').info('User action');
// Output: { requestId: 'req-456', userId: 456, message: 'User action', ... }

// Clear or change the request ID
log.setRequestId('req-789');
log.info('New request');
// Output: { requestId: 'req-789', message: 'New request', ... }
```

This pattern demonstrates the key interaction: the mixin provides methods to manage state on the LogLayer instance, and the plugin automatically reads that state and enriches log data without requiring manual intervention in your logging code.

Plugins registered through `pluginsToAdd` are automatically added to all LogLayer instances created **after** the mixin is registered, just like the mixin methods themselves.

### Registration Function

Create a registration function that returns a `LogLayerMixinRegistration`, which is what users of your mixin will call with `useLogLayerMixin()` to register the mixin before creating any LogLayer instances.

The registration function:
- Might take in optional configuration parameters
- Can initialize shared state based on the configuration
- Returns a `LogLayerMixinRegistration` object containing the mixins (and optionally plugins) to register

```typescript
import type { LogLayerMixinRegistration, LogLayerPlugin } from 'loglayer';

// The registration function is what users will import and call
export function customMixin(config?: CustomMixinConfig): LogLayerMixinRegistration {
  // Optional: Initialize shared state based on config
  if (config) {
    // Initialize any shared state, validate config, etc.
  }
  
  // Reference the mixin implementation created earlier
  return {
    mixinsToAdd: [customMixinImplementation],
    pluginsToAdd: [/* optional plugins */] // See "Using Plugins with Mixins" below
  };
}
```

**Users of your mixin will register it like this:**

```typescript
import { useLogLayerMixin } from 'loglayer';
import { customMixin } from '@your-package/mixin';

// Register a single mixin (must be called before creating LogLayer instances)
useLogLayerMixin(customMixin({ /* optional config */ }));

// Or register multiple mixins at once
useLogLayerMixin([
  customMixin({ /* optional config */ }),
  // otherMixin(),
]);

// Now all LogLayer instances will have your mixin methods
const log = new LogLayer({ transport: ... });
log.customMethod(); // Your mixin method is available
```

## Mixin Reference

### Mixin Types

LogLayer supports two types of mixins:

**LogLayer Mixins** extend the `LogLayer` class prototype. Methods are available directly on LogLayer instances:

```typescript
const log = new LogLayer({ transport: ... });
log.customMethod(); // Your mixin method
```

**LogBuilder Mixins** extend the `LogBuilder` class prototype. Certain methods in the `LogLayer` class will return an instance of the `LogBuilder`.

```typescript
const log = new LogLayer({ transport: ... });
log.withMetadata({}).customBuilderMethod();
```

### Interface Definitions

#### LogLayerMixin

```typescript
interface LogLayerMixin {
  /**
   * Specifies that this mixin augments the main LogLayer class.
   */
  augmentationType: LogLayerMixinAugmentType.LogLayer;

  /**
   * Called at the end of the LogLayer construct() method.
   * The LogLayer instance is passed as the first parameter.
   */
  onConstruct?: (instance: LogLayer, config: LogLayerConfig) => void;

  /**
   * Function that performs the augmentation of the LogLayer prototype.
   */
  augment: (prototype: typeof LogLayer.prototype) => void;

  /**
   * Function that performs the augmentation of the MockLogLayer prototype.
   * This is called to ensure the mock class has the same functionality as the real class.
   * Mock implementations should typically be no-ops that return the instance for chaining.
   */
  augmentMock: (prototype: typeof MockLogLayer.prototype) => void;
}
```

#### LogBuilderMixin

```typescript
interface LogBuilderMixin {
  /**
   * Specifies that this mixin augments the main LogBuilder class.
   */
  augmentationType: LogLayerMixinAugmentType.LogBuilder;

  /**
   * Called at the end of the LogBuilder construct() method.
   * The LogBuilder instance is passed as the first parameter.
   */
  onConstruct?: (instance: LogBuilder, logger: LogLayer) => void;

  /**
   * Function that performs the augmentation of the LogBuilder prototype.
   */
  augment: (prototype: typeof LogBuilder.prototype) => void;

  /**
   * Function that performs the augmentation of the MockLogBuilder prototype.
   * This is called to ensure the mock class has the same functionality as the real class.
   * Mock implementations should typically be no-ops that return the instance for chaining.
   */
  augmentMock: (prototype: typeof MockLogBuilder.prototype) => void;
}
```

#### LogLayerMixinRegistration

```typescript
interface LogLayerMixinRegistration {
  /**
   * Array of mixins to add to LogLayer.
   */
  mixinsToAdd: LogLayerMixinType[];
  
  /**
   * Optional array of plugins to add to LogLayer.
   * Plugins registered here are automatically added to all LogLayer instances
   * created after the mixin is registered.
   */
  pluginsToAdd?: LogLayerPlugin[];
}
```

## Creating In-Project

If you want to quickly add a mixin for your own project:

```typescript
import { LogLayer, useLogLayerMixin, ConsoleTransport, LogLayerMixinAugmentType } from 'loglayer';
import type { LogLayerMixin, LogLayerMixinRegistration, LogLayer, ILogLayer } from 'loglayer';
import type { MockLogLayer } from 'loglayer';

// 1. Define TypeScript declarations using a generic interface
export interface IMetricsMixin {
  /**
   * Records a custom metric
   */
  recordMetric(name: string, value: number): this;
}

// Augment the concrete classes...
declare module 'loglayer' {
  interface LogLayer extends IMetricsMixin {}
  interface MockLogLayer extends IMetricsMixin {}
}

// ...and the ILogLayer interface where it lives (@loglayer/shared)
declare module '@loglayer/shared' {
  interface ILogLayer<This> extends IMetricsMixin {}
}

// 2. Create the mixin
const metricsMixin: LogLayerMixin = {
  augmentationType: LogLayerMixinAugmentType.LogLayer,
  augment: (prototype) => {
    prototype.recordMetric = function (this: LogLayer, name: string, value: number): LogLayer {
      console.log(`Metric: ${name} = ${value}`);
      return this;
    };
  },
  augmentMock: (prototype) => {
    prototype.recordMetric = function (this: MockLogLayer, name: string, value: number): MockLogLayer {
      // Mock implementation - no-op for testing
      return this;
    };
  }
};

// 3. Register the mixin (must be called before creating LogLayer instances)
// You can register a single mixin:
useLogLayerMixin({
  mixinsToAdd: [metricsMixin]
});

// Or register multiple mixins at once:
// useLogLayerMixin([
//   { mixinsToAdd: [metricsMixin] },
//   // other mixin registrations...
// ]);

// 4. Create LogLayer instance and use your custom method
// ILogLayer automatically includes mixin methods through the generic parameter
const log: ILogLayer = new LogLayer({
  transport: new ConsoleTransport({
    logger: console
  })
});

// Mixin methods are available directly
log.recordMetric('requests', 1).info('Request received');

// Mixin methods are preserved through method chaining
log.withContext({ userId: 123 }).recordMetric('requests', 1).info('Request received');
```

## As an NPM Package

When creating a reusable mixin package:

### TypeScript Setup

To use your mixin with TypeScript, users must register the types by adding your mixin package to their `tsconfig.json` includes:

```json
{
  "include": [
    "./node_modules/@your-package/mixin-name"
  ]
}
```

This ensures TypeScript recognizes the mixin methods on LogLayer instances.

### Package.json

You need `loglayer` for types.

**Peer Dependencies:**

Since mixins are registered before LogLayer is used, `loglayer` should be installed as a **peer dependency** as the end-user will have their own version of loglayer.

**Important:** Specify the minimal version of `loglayer` required for your mixin using the `>=` version range. For example, if your mixin requires features introduced in LogLayer v7.0.2:

```json
{
  "peerDependencies": {
    "loglayer": ">=7.0.2"
  }
}
```

This ensures that users have at least version 7.0.2 of `loglayer` installed, while allowing them to use any newer compatible versions (7.1.0, 8.0.0, etc.).

## Testing Your Mixin

Testing mixins is crucial to ensure they work correctly with both `LogLayer` and `MockLogLayer`. For comprehensive testing guidance including unit testing, integration testing, and using LogLayer's testing utilities, see the [Testing Mixins](/mixins/testing-mixins) guide.

## Important Considerations

### Avoiding Arrow Functions When Assigning Methods

When assigning methods to the prototype, always use regular functions (not arrow functions). Arrow functions don't have their own `this` binding and may override the context. However, you can use an arrow function for the `augment` method itself:

```typescript
// Correct: Arrow function for augment is fine
augment: (prototype) => {
  // Wrong: Arrow function for the method itself
  prototype.myMethod = () => { /* `this` may be wrong */ };

  // Correct: Regular function for the method
  prototype.myMethod = function (this: LogLayer) {
    // `this` is correctly bound to the instance
    return this;
  };
}
```

## Boilerplate / Template Code

A sample project that you can use as a template is provided here:

[GitHub Boilerplate Template](https://github.com/loglayer/loglayer-mixin-boilerplate)