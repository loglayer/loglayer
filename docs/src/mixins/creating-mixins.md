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
// types.ts
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
  
  // Extend ILogLayer to include the augmented methods
  interface ILogLayer extends LogLayer {}
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
  
  // Extend ILogBuilder to include the augmented methods
  interface ILogBuilder extends LogBuilder {}
}
```

::: danger Required Interface Extensions
You **must** include the `interface ILogLayer extends LogLayer {}` declaration for `LogLayer` class mixins and `interface ILogBuilder extends LogBuilder {}` for `LogBuilder` class mixins. Without these declarations, if code uses the `ILogLayer` or `ILogBuilder` interfaces (which is common in dependency injection and testing scenarios), TypeScript will not recognize the mixin methods, causing type errors and preventing access to your mixin functionality.
:::

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
declare module 'loglayer' {
  interface LogLayer {
    /**
     * Sets the current request ID for correlation tracking
     */
    setRequestId(requestId: string): LogLayer;
    
    /**
     * Gets the current request ID
     */
    getRequestId(): string | undefined;
  }
  
  interface MockLogLayer {
    setRequestId(requestId: string): MockLogLayer;
    getRequestId(): string | undefined;
  }
  
  // Extend ILogLayer to include the augmented methods
  interface ILogLayer extends LogLayer {}
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
import { requestTrackingMixin } from '@your-package/request-tracking';

// Register the mixin (includes the plugin automatically)
useLogLayerMixin(requestTrackingMixin());

// Create LogLayer instance
const log = new LogLayer({
  transport: new ConsoleTransport({ logger: console })
});

// Use the mixin method to set request context
log.setRequestId('req-123');

// All subsequent logs automatically include the request ID via the plugin
log.info('Processing user request');
// Output: { requestId: 'req-123', message: 'Processing user request', ... }

log.withMetadata({ userId: 456 }).info('User action');
// Output: { requestId: 'req-123', userId: 456, message: 'User action', ... }

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
  
  // Extend ILogLayer to include the augmented methods
  interface ILogLayer extends LogLayer {}
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

**Important:** Specify the minimal version of `loglayer` required for your mixin using the `>=` version range. For example, if your mixin requires features introduced in LogLayer v7.0.2:

### Package.json

```json
{
  "peerDependencies": {
    "loglayer": ">=7.0.2"
  }
}
```

This ensures that users have at least version 7.0.0 of `loglayer` installed, while allowing them to use any newer compatible versions (7.1.0, 8.0.0, etc.).

### Exporting Type Declarations

**Important:** If your type declarations are in separate files (e.g., `types.ts`), you must import them in your main entry file (typically `index.ts`) so TypeScript includes them when the package is consumed. Otherwise, the type declarations won't be available to users of your package:

```typescript
// index.ts
import "./types.js";
// ... rest of your code
```

These side-effect imports ensure that TypeScript processes the `declare module` directives and makes them available to consumers of your package.

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

## Boilerplate / Template Code

A sample project that you can use as a template is provided here:

[GitHub Boilerplate Template](https://github.com/loglayer/loglayer-mixin-boilerplate)