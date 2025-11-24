---
title: Testing Mixins
description: Learn how to write tests for your LogLayer mixins
---

# Testing Mixins

LogLayer provides testing utilities to help you test your mixins. Since mixins add methods directly to LogLayer instances, testing focuses on verifying that your mixin methods work correctly and integrate properly with the LogLayer API.

There are two approaches to testing mixins:
- **Unit Testing**: Uses `TestTransport` and `TestLoggingLibrary` for fast, isolated tests with assertions
- **Live Testing**: Uses real transports to verify actual output and real-world behavior

## Example Mixin

We'll use the performance timing mixin from the [Creating Mixins](/mixins/creating-mixins) guide as our example. This mixin adds `withPerfStart()` and `withPerfEnd()` methods to both `LogLayer` and `LogBuilder`, and includes a plugin that automatically adds performance timing data to log metadata.

First, here's the complete mixin implementation:

```typescript
// perf-timing-mixin.ts
import type {
  LogLayerMixin,
  LogBuilderMixin,
  LogLayer,
  LogBuilder,
  LogLayerMixinRegistration,
  LogLayerPlugin,
  MockLogLayer,
  MockLogBuilder,
} from 'loglayer';
import { LogLayerMixinAugmentType, LogBuilder, MockLogBuilder } from 'loglayer';
import type { PluginBeforeDataOutParams } from 'loglayer';

// TypeScript declarations
export interface IPerfTimingMixin<T> {
  withPerfStart(id: string): T;
  withPerfEnd(id: string): T;
}

// Required: Augment @loglayer/shared for type preservation through method chaining
declare module '@loglayer/shared' {
  interface ILogLayer<This> extends IPerfTimingMixin<This> {}
  interface ILogBuilder<This> extends IPerfTimingMixin<This> {}
}

// Required: Augment loglayer for runtime prototype augmentation
declare module 'loglayer' {
  interface LogLayer extends IPerfTimingMixin<LogLayer> {}
  interface LogBuilder extends IPerfTimingMixin<LogBuilder> {}
  interface MockLogLayer extends IPerfTimingMixin<MockLogLayer> {}
  interface MockLogBuilder extends IPerfTimingMixin<MockLogBuilder> {}
}

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

## Unit Testing

Unit tests use `TestTransport` and `TestLoggingLibrary` to verify mixin methods and plugin integration without requiring external dependencies. These are fast, isolated tests that use assertions to verify behavior.

### TestLoggingLibrary API

The `TestLoggingLibrary` provides several methods to help you test your mixins:

- `lines`: Array of all logged lines (each line has `level` and `data`)
- `getLastLine()`: Get the last line that was logged
- `popLine()`: Get and remove the last line that was logged
- `clearLines()`: Clear all logged lines

Each line in `lines` has the following structure:

```typescript
{
  level: 'info' | 'warn' | 'error' | 'debug' | 'trace' | 'fatal';
  data: any[]; // Array of data passed to the logger
}
```

The `data` array contains the actual log data, with metadata typically in the first element:

```typescript
const line = logger.popLine();
const logData = line.data[0]; // Usually contains metadata and message
expect(logData.perfTimings).toBeDefined();
```

### Example Unit Test

```typescript
import { LogLayer, useLogLayerMixin, TestLoggingLibrary, TestTransport } from 'loglayer';
import { describe, expect, it, beforeEach } from 'vitest';
import { perfTimingMixin } from './perf-timing-mixin.js';

describe('perfTimingMixin', () => {
  let log: LogLayer;
  let logger: TestLoggingLibrary;

  beforeEach(() => {
    logger = new TestLoggingLibrary();
    useLogLayerMixin(perfTimingMixin());
    log = new LogLayer({
      transport: new TestTransport({ logger }),
    });
  });

  it('should add mixin methods and plugin-enriched data via TestLoggingLibrary', async () => {
    // Mixin methods are available
    expect(typeof log.withPerfStart).toBe('function');
    expect(typeof log.withPerfEnd).toBe('function');
    
    // Use mixin methods to track timing
    log.withPerfStart('api-call');
    await new Promise(resolve => setTimeout(resolve, 20));
    log.withPerfEnd('api-call').info('API call completed');
    
    // TestLoggingLibrary captures plugin-modified data
    const line = logger.popLine();
    expect(line?.data[0]).toHaveProperty('perfTimings');
    expect(line?.data[0].perfTimings['api-call']).toBeGreaterThanOrEqual(20);
  });

  it('should verify plugin state management via TestLoggingLibrary', async () => {
    log.withPerfStart('timer');
    await new Promise(resolve => setTimeout(resolve, 10));
    
    log.withPerfEnd('timer').info('First log');
    const firstLine = logger.popLine();
    expect(firstLine?.data[0].perfTimings).toHaveProperty('timer');
    
    // Plugin cleared state, so second log has no perfTimings
    log.info('Second log');
    const secondLine = logger.popLine();
    expect(secondLine?.data[0]).not.toHaveProperty('perfTimings');
  });
});
```

## Live Testing

Live tests verify that your mixin works correctly with real transports and outputs. Live tests use actual transports (like `ConsoleTransport`) to see the real output and verify end-to-end behavior.

For comprehensive testing, you should test your mixin with both `LogLayer` and `MockLogLayer` to verify that your `augmentMock` implementation works correctly. This ensures that mock implementations behave correctly in test environments.

Here's a complete live test example for the performance timing mixin that tests both implementations:

```typescript
// livetest.ts
import { LogLayer, MockLogLayer, useLogLayerMixin, ConsoleTransport } from 'loglayer';
import { perfTimingMixin } from './perf-timing-mixin.js';

// Register the mixin before creating LogLayer instances
useLogLayerMixin(perfTimingMixin());

// Test helper function to run tests with either LogLayer or MockLogLayer
async function runTests(log: LogLayer | MockLogLayer, testName: string) {
  console.log(`\n===== ${testName} =====\n`);
  
  // Test mixin methods on LogLayer
  console.log('===== withPerfStart/End on LogLayer =====');
  log.withPerfStart('api-call').info('API call started');
  await new Promise(resolve => setTimeout(resolve, 50));
  log.withPerfEnd('api-call').info('API call completed');

  // Test mixin methods on LogBuilder
  console.log('\n===== withPerfStart/End on LogBuilder =====');
  log.withMetadata({ userId: 123 })
     .withPerfStart('db-query')
     .info('Database query started');

  await new Promise(resolve => setTimeout(resolve, 30));

  log.withPerfEnd('db-query')
     .withMetadata({ result: 'success' })
     .info('Database query completed');

  // Test multiple timers
  console.log('\n===== Multiple Timers =====');
  log.withPerfStart('timer-1');
  log.withPerfStart('timer-2');
  await new Promise(resolve => setTimeout(resolve, 20));
  log.withPerfEnd('timer-1');
  log.withPerfEnd('timer-2');
  log.info('Both timers ended');

  // Test method chaining
  console.log('\n===== Method Chaining =====');
  log.withPerfStart('chained-timer')
     .withMetadata({ step: 1 })
     .info('Process started');

  await new Promise(resolve => setTimeout(resolve, 25));

  log.withPerfEnd('chained-timer')
     .withMetadata({ step: 2 })
     .warn('Process completed');
}

console.log('\n===== Start Livetest for: perfTimingMixin =====\n');

// Test with LogLayer (real implementation)
const log = new LogLayer({
  transport: new ConsoleTransport({
    logger: console,
  }),
});
await runTests(log, 'Testing with LogLayer');

// Test with MockLogLayer (mock implementation)
const mockLog = new MockLogLayer();
await runTests(mockLog, 'Testing with MockLogLayer');

console.log('\n===== End Livetest for: perfTimingMixin =====\n');
```

This two-round testing pattern ensures:
- Your mixin methods work correctly with the real `LogLayer` implementation
- Your `augmentMock` implementation provides the same API surface for `MockLogLayer`

Run the live test with:

```bash
pnpm run livetest
# or
npx tsx livetest.ts
```

## Implementing augmentMock for Wrapper Methods

If your mixin includes methods that wrap functions (like timer methods), your `augmentMock` implementation should return the function itself so it can still be executed, just without the side effects.

For example, if you have a timer method that wraps a function:

```typescript
// Real implementation
augment: (prototype) => {
  prototype.statsTimer = function(this: LogLayer, fn: Function, stat: string) {
    // Wrap function with timing logic
    return client.timer(fn, stat);
  };
},

// Mock implementation - return the function so it can still be executed
augmentMock: (prototype) => {
  prototype.statsTimer = function(this: MockLogLayer, fn: Function, _stat: string) {
    // Return the function itself - no-op for testing
    return fn;
  };
}
```

This ensures that when testing with `MockLogLayer`, the wrapped functions still execute correctly, just without the timing/metrics being sent.
