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

_Mixin functionality and types are provided directly by the `loglayer` package; no other external packages are required._

## Anatomy of a Mixin in LogLayer

A mixin consists of several key components:

1. TypeScript type declarations for your new methods
2. The mixin implementation that augments the prototype of the class you want to add to and its corresponding mock
3. A registration function that users call to register the mixin
4. Optional plugins that work with the mixin to modify logging data

### TypeScript Type Declarations

Use TypeScript declaration merging to add type definitions for your new methods. **You must declare methods for both the real class and its corresponding mock class** to ensure type safety in both production code and tests:

```typescript
declare module 'loglayer' {
  interface LogLayer {
    /**
     * Your method documentation
     */
    customMethod(param: string): LogLayer;
  }
  
  // Also declare for MockLogLayer (required)
  interface MockLogLayer {
    /**
     * Your method documentation
     */
    customMethod(param: string): MockLogLayer;
  }
}
```

For LogBuilder mixins:

```typescript
declare module 'loglayer' {
  interface LogBuilder {
    /**
     * Your method documentation
     */
    customBuilderMethod(param: string): LogBuilder;
  }
  
  // Also declare for MockLogBuilder (required)
  interface MockLogBuilder {
    /**
     * Your method documentation
     */
    customBuilderMethod(param: string): MockLogBuilder;
  }
}
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

Plugins are included in the registration function's return value via the `pluginsToAdd` array:

```typescript
import type { LogLayerPlugin, PluginBeforeDataOutParams } from 'loglayer';

// Create a plugin that works with your mixin
const customMixinPlugin: LogLayerPlugin = {
  onBeforeDataOut: (params: PluginBeforeDataOutParams, loglayer: LogLayer) => {
    // Access mixin state or enrich log data
    // For example, add mixin-specific metadata to all logs
    return {
      ...params.data,
      mixinData: /* access mixin state here */
    };
  }
};

export function useCustomMixin(config?: CustomMixinConfig): LogLayerMixinRegistration {
  return {
    mixinsToAdd: [customMixinImplementation],
    pluginsToAdd: [customMixinPlugin] // Include the plugin
  };
}
```

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
import type { LogLayerMixin, LogLayerMixinRegistration, LogLayer } from 'loglayer';

// 1. Define TypeScript declarations
declare module 'loglayer' {
  interface LogLayer {
    /**
     * Records a custom metric
     */
    recordMetric(name: string, value: number): LogLayer;
  }
  
  // Also declare for MockLogLayer (required)
  interface MockLogLayer {
    recordMetric(name: string, value: number): MockLogLayer;
  }
}

// 2. Create the mixin
import type { MockLogLayer } from 'loglayer';

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
const log = new LogLayer({
  transport: new ConsoleTransport({
    logger: console
  })
});

log.recordMetric('requests', 1).info('Request received');
```

## As an NPM Package

When creating a reusable mixin package:

### Install Dependencies

You need `loglayer` for types. Since mixins are registered before LogLayer is used, `loglayer` should be installed as a **peer dependency** as the end-user will have their own version of loglayer.

**Important:** Specify the minimal version of `loglayer` required for your mixin using the `>=` version range. For example, if your mixin requires features introduced in LogLayer v7.0.0:

### Package.json

```json
{
  "peerDependencies": {
    "loglayer": ">=7.0.0"
  }
}
```

This ensures that users have at least version 7.0.0 of `loglayer` installed, while allowing them to use any newer compatible versions (7.1.0, 8.0.0, etc.).

### Recommended Project Structure

Organize your mixin package with the following structure:

```
your-mixin-package/
├── src/
│   ├── __tests__/
│   │   ├── index.test.ts          # Unit tests
│   │   └── livetest.ts            # Optional: Live integration tests
│   ├── LogLayer.augment.ts        # Real class augmentation (or LogBuilder.augment.ts)
│   ├── LogLayer.types.ts          # TypeScript type declarations for LogLayer
│   ├── MockLogLayer.augment.ts    # Mock class augmentation (or MockLogBuilder.augment.ts)
│   ├── MockLogLayer.types.ts      # TypeScript type declarations for MockLogLayer
│   ├── client.ts                  # Optional: Shared utilities/client setup
│   └── index.ts                   # Main entry point with registration function
├── dist/                          # Compiled output (generated)
├── package.json
├── tsconfig.json
├── tsdown.config.json             # Or your build tool config
└── README.md
```

**Key Files:**

- **`src/index.ts`**: Exports your registration function (e.g., `hotshotsMixin()`)
- **`src/LogLayer.augment.ts`**: Contains the `augment` function implementation
- **`src/MockLogLayer.augment.ts`**: Contains the `augmentMock` function implementation
- **`src/LogLayer.types.ts`**: TypeScript declarations for `LogLayer` interface
- **`src/MockLogLayer.types.ts`**: TypeScript declarations for `MockLogLayer` interface

This separation keeps your code organized and makes it easier to maintain. You can also combine related files (e.g., both augment functions in one file) if your mixin is simple.

## Important Considerations

### Avoiding Arrow Functions When Assigning Methods

When assigning methods to the prototype, always use regular functions (not arrow functions). Arrow functions don't have their own `this` binding and may override the context. However, you can use an arrow function for the `augment` method itself:

```typescript
// ✅ Correct: Arrow function for augment is fine
augment: (prototype) => {
  // ❌ Wrong: Arrow function for the method itself
  prototype.myMethod = () => { /* `this` may be wrong */ };
  
  // ✅ Correct: Regular function for the method
  prototype.myMethod = function (this: LogLayer) {
    // `this` is correctly bound to the instance
    return this;
  };
}
```

### TypeScript Type Casting

You may need to use type assertions (`as any`) when implementing methods due to TypeScript's strict type checking on prototype augmentation:

```typescript
prototype.myMethod = function (this: LogLayer, ...args: any[]): LogLayer {
  // Implementation
  return this;
} as any;
```

## Example

Here's a complete example of a performance timing mixin that adds `withPerfStart()` and `withPerfEnd()` methods to both `LogLayer` and `LogBuilder`. The methods track the time between start and end calls and automatically add the timing data to log metadata via a plugin.

### TypeScript Declarations

```typescript
declare module 'loglayer' {
  interface LogLayer {
    /**
     * Starts a performance timer with the given ID
     */
    withPerfStart(id: string): LogBuilder;
    
    /**
     * Ends a performance timer with the given ID and adds timing to metadata
     */
    withPerfEnd(id: string): LogBuilder;
  }
  
  interface LogBuilder {
    /**
     * Starts a performance timer with the given ID
     */
    withPerfStart(id: string): LogBuilder;
    
    /**
     * Ends a performance timer with the given ID and adds timing to metadata
     */
    withPerfEnd(id: string): LogBuilder;
  }
  
  // Mock class declarations (required)
  interface MockLogLayer {
    withPerfStart(id: string): any;
    withPerfEnd(id: string): any;
  }
  
  interface MockLogBuilder {
    withPerfStart(id: string): MockLogBuilder;
    withPerfEnd(id: string): MockLogBuilder;
  }
}
```

### Mixin Implementation

```typescript
import type {
  LogLayerMixin,
  LogBuilderMixin,
  LogLayer,
  LogBuilder,
  LogLayerMixinRegistration,
  LogLayerPlugin,
  LogLayerConfig,
  MockLogLayer,
  MockLogBuilder
} from 'loglayer';
import { LogLayerMixinAugmentType, LogBuilder, MockLogBuilder } from 'loglayer';
import type { PluginBeforeDataOutParams } from 'loglayer';

// Module-level storage for performance timing state
const perfStartTimes = new Map<string, number>();
const perfDurations = new Map<string, number>();

// LogLayer mixin - methods return LogBuilder
const logLayerPerfMixin: LogLayerMixin = {
  augmentationType: LogLayerMixinAugmentType.LogLayer,
  augment: (prototype) => {
    prototype.withPerfStart = function (this: LogLayer, id: string): LogBuilder {
      return new LogBuilder(this).withPerfStart(id);
    };
    
    prototype.withPerfEnd = function (this: LogLayer, id: string): LogBuilder {
      return new LogBuilder(this).withPerfEnd(id);
    };
  },
  augmentMock: (prototype) => {
    prototype.withPerfStart = function (this: MockLogLayer, id: string): any {
      return new MockLogBuilder(this).withPerfStart(id);
    };
    
    prototype.withPerfEnd = function (this: MockLogLayer, id: string): any {
      return new MockLogBuilder(this).withPerfEnd(id);
    };
  }
};

// LogBuilder mixin - actual implementation
const logBuilderPerfMixin: LogBuilderMixin = {
  augmentationType: LogLayerMixinAugmentType.LogBuilder,
  augment: (prototype) => {
    prototype.withPerfStart = function (this: LogBuilder, id: string): LogBuilder {
      perfStartTimes.set(id, Date.now());
      return this;
    };
    
    prototype.withPerfEnd = function (this: LogBuilder, id: string): LogBuilder {
      const startTime = perfStartTimes.get(id);
      
      if (startTime !== undefined) {
        const duration = Date.now() - startTime;
        perfDurations.set(id, duration);
        perfStartTimes.delete(id);
      }
      
      return this;
    };
  },
  augmentMock: (prototype) => {
    prototype.withPerfStart = function (this: MockLogBuilder, id: string): MockLogBuilder {
      // Mock implementation - no-op for testing
      return this;
    };
    
    prototype.withPerfEnd = function (this: MockLogBuilder, id: string): MockLogBuilder {
      // Mock implementation - no-op for testing
      return this;
    };
  }
};

// Plugin that adds performance timings to log metadata
const perfPlugin: LogLayerPlugin = {
  onBeforeDataOut: (params: PluginBeforeDataOutParams) => {
    const perfTimings: Record<string, number> = {};
    
    // Collect all durations and clear them
    for (const [id, duration] of perfDurations.entries()) {
      perfTimings[id] = duration;
      perfDurations.delete(id);
    }
    
    if (Object.keys(perfTimings).length > 0) {
      return {
        ...params.data,
        perfTimings
      };
    }
    
    return params.data;
  }
};

// Registration function
export function perfTimingMixin(): LogLayerMixinRegistration {
  return {
    mixinsToAdd: [logLayerPerfMixin, logBuilderPerfMixin],
    pluginsToAdd: [perfPlugin]
  };
}
```

### Usage

```typescript
import { useLogLayerMixin, LogLayer, ConsoleTransport } from 'loglayer';
import { perfTimingMixin } from './perf-timing-mixin';

// Register a single mixin
useLogLayerMixin(perfTimingMixin());

// Or register multiple mixins at once
// useLogLayerMixin([
//   perfTimingMixin(),
//   // otherMixin(),
// ]);

// Create LogLayer instance
const log = new LogLayer({
  transport: new ConsoleTransport({ logger: console })
});

// Usage on LogLayer - creates LogBuilder automatically
log.withPerfStart('api-call')
   .withMetadata({ userId: 123 })
   .info('API request started');

// Later, end the timer and send the log
log.withPerfEnd('api-call').info('API request completed');
// The log will include perfTimings: { 'api-call': <duration in ms> } in metadata
```