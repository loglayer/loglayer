/**
 * Type tests for mixin combinations
 *
 * This file tests various type scenarios to ensure mixins work correctly
 * with the generic type parameters. If this file compiles without errors,
 * the type system is working as expected.
 */

import type { ILogLayer, ILogBuilder } from 'loglayer';
import { LogLayer, MockLogLayer } from 'loglayer';

// Import mixins to trigger module augmentation
import type { IMetricsMixin } from './metrics-mixin.js';
import './metrics-mixin.js';
// Note: builder-mixin is not imported because MockLogLayer implements ILogBuilder<MockLogLayer>,
// and adding builder-only mixin methods would require MockLogLayer to implement them.
// In practice, most mixins should extend both ILogLayer and ILogBuilder (like dual-mixin).
import type { ITracingMixin } from './dual-mixin.js';
import './dual-mixin.js';

// Import hot-shots mixin for testing (imports types to trigger module augmentation)
import type { IHotShotsMixin } from '@loglayer/mixin-hot-shots';
import '@loglayer/mixin-hot-shots';

// Test 1: ILogLayer has mixin methods directly
function test1_ILogLayerHasMixinMethods() {
  const logger: ILogLayer = new LogLayer({ transport: {} as any });

  // Metrics mixin methods should be available
  logger.recordMetric('test', 1);
  logger.incrementCounter('test');

  // Tracing mixin methods should be available
  logger.withTraceId('trace-123');
  logger.withSpanId('span-456');
}

// Test 2: Method chaining preserves ILogLayer mixin types
function test2_MethodChainingPreservesLogLayerTypes() {
  const logger: ILogLayer = new LogLayer({ transport: {} as any });

  // Chain should preserve all mixin methods
  logger
    .withContext({ userId: 123 })
    .recordMetric('requests', 1)  // Metrics mixin
    .withTraceId('trace-123')     // Tracing mixin
    .incrementCounter('calls')    // Metrics mixin
    .withSpanId('span-456')       // Tracing mixin
    .withPrefix('API')
    .info('test');
}

// Test 3: ILogBuilder has dual mixin methods
function test3_ILogBuilderHasDualMixinMethods() {
  const logger: ILogLayer = new LogLayer({ transport: {} as any });

  // Transition to ILogBuilder
  const builder: ILogBuilder = logger.withMetadata({ foo: 'bar' });

  // Tracing mixin methods should be available (dual mixin)
  builder.withTraceId('trace-123');
  builder.withSpanId('span-456');
}

// Test 4: Method chaining preserves ILogBuilder mixin types
function test4_MethodChainingPreservesBuilderTypes() {
  const logger: ILogLayer = new LogLayer({ transport: {} as any });

  logger
    .withMetadata({ foo: 'bar' })       // Returns ILogBuilder
    .withTraceId('trace-123')           // Tracing mixin (dual)
    .withSpanId('span-456')             // Tracing mixin (dual)
    .withError(new Error('test'))
    .withTraceId('trace-456')           // Still available after withError
    .info('test');
}

// Test 5: Multiple mixin methods work together on ILogLayer
function test5_MultipleMixinsOnLogLayer() {
  const logger: ILogLayer = new LogLayer({ transport: {} as any });

  logger
    .recordMetric('metric1', 100)       // Metrics mixin
    .withTraceId('trace-123')           // Tracing mixin
    .incrementCounter('counter1')       // Metrics mixin
    .withSpanId('span-456')             // Tracing mixin
    .recordMetric('metric2', 200)       // Metrics mixin
    .info('test');
}

// Test 6: Multiple mixin methods work together on ILogBuilder
function test6_MultipleMixinsOnLogBuilder() {
  const logger: ILogLayer = new LogLayer({ transport: {} as any });

  logger
    .withMetadata({ test: 'data' })
    .withTraceId('trace-123')           // Tracing mixin (dual)
    .withSpanId('span-456')             // Tracing mixin (dual)
    .withError(new Error('test'))
    .withTraceId('trace-789')           // Tracing still available
    .info('test');
}

// Test 7: LogLayer to ILogBuilder transition preserves dual mixin types
function test7_LogLayerToBuilderTransition() {
  const logger: ILogLayer = new LogLayer({ transport: {} as any });

  logger
    .recordMetric('requests', 1)        // ILogLayer mixin
    .withTraceId('trace-123')           // ILogLayer mixin (dual)
    .withMetadata({ foo: 'bar' })       // Transition to ILogBuilder
    .withTraceId('trace-456')           // Still available (dual mixin)
    .withSpanId('span-123')             // Dual mixin
    .info('test');
}

// Test 8: MockLogLayer has mixin methods
function test8_MockLogLayerHasMixinMethods() {
  const logger: ILogLayer = new MockLogLayer();

  // All mixin methods should be available on MockLogLayer
  logger.recordMetric('test', 1);
  logger.incrementCounter('test');
  logger.withTraceId('trace-123');
  logger.withSpanId('span-456');
}

// Test 9: MockLogLayer method chaining preserves types
function test9_MockLogLayerChaining() {
  const logger: ILogLayer = new MockLogLayer();

  logger
    .withContext({ userId: 123 })
    .recordMetric('requests', 1)
    .withTraceId('trace-123')
    .incrementCounter('calls')
    .withSpanId('span-456')
    .info('test');
}

// Test 10: MockLogLayer to builder transition
function test10_MockLogLayerToBuilder() {
  const logger: ILogLayer = new MockLogLayer();

  logger
    .recordMetric('requests', 1)
    .withMetadata({ foo: 'bar' })
    .withTraceId('trace-123')
    .withSpanId('span-456')
    .info('test');
}

// Test 11: Concrete LogLayer type (not ILogLayer interface)
function test11_ConcreteLogLayerType() {
  const logger = new LogLayer({ transport: {} as any });

  // All mixin methods should work on concrete type
  logger
    .recordMetric('test', 1)
    .withTraceId('trace-123')
    .incrementCounter('test')
    .withSpanId('span-456')
    .info('test');
}

// Test 12: Concrete MockLogLayer type
function test12_ConcreteMockLogLayerType() {
  const logger = new MockLogLayer();

  logger
    .recordMetric('test', 1)
    .withTraceId('trace-123')
    .incrementCounter('test')
    .withSpanId('span-456')
    .info('test');
}

// Test 13: Child logger preserves mixin types
function test13_ChildLoggerPreservesMixinTypes() {
  const logger: ILogLayer = new LogLayer({ transport: {} as any });

  const child = logger.child();

  // Child should have all mixin methods
  child
    .recordMetric('test', 1)
    .withTraceId('trace-123')
    .incrementCounter('test')
    .withSpanId('span-456')
    .info('test');
}

// Test 14: withPrefix returns type with mixin methods
function test14_WithPrefixPreservesMixinTypes() {
  const logger: ILogLayer = new LogLayer({ transport: {} as any });

  const prefixed = logger.withPrefix('API');

  // Prefixed logger should have all mixin methods
  prefixed
    .recordMetric('test', 1)
    .withTraceId('trace-123')
    .info('test');
}

// Test 15: Complex chaining scenario
function test15_ComplexChainingScenario() {
  const logger: ILogLayer = new LogLayer({ transport: {} as any });

  logger
    .withContext({ requestId: 'req-123' })
    .recordMetric('requests', 1)          // Metrics mixin
    .withTraceId('trace-123')             // Tracing mixin
    .child()
    .withPrefix('API')
    .incrementCounter('api-calls')        // Metrics mixin
    .withSpanId('span-456')               // Tracing mixin
    .withMetadata({ endpoint: '/users' }) // Transition to builder
    .withTraceId('trace-456')             // Tracing mixin (still available)
    .withSpanId('span-789')               // Tracing mixin (still available)
    .withError(new Error('test'))
    .info('API request');
}

// Test 16: Type narrowing with explicit ILogBuilder type
function test16_ExplicitBuilderType() {
  const logger: ILogLayer = new LogLayer({ transport: {} as any });

  const builder: ILogBuilder = logger
    .recordMetric('test', 1)
    .withMetadata({ foo: 'bar' });

  // Builder should have dual mixin methods
  builder
    .withTraceId('trace-123')
    .withSpanId('span-456')
    .withError(new Error('test'))
    .info('test');
}

// Test 17: Hot-shots mixin stats property is available on ILogLayer
function test17_HotShotsStatsAvailable() {
  const logger: ILogLayer = new LogLayer({ transport: {} as any });

  // stats property should be available
  logger.stats.increment('counter').send();
  logger.stats.gauge('gauge', 100).send();
  logger.stats.timing('timer', 500).send();
  logger.stats.histogram('histogram', 200).send();
}

// Test 18: Hot-shots stats chaining with other mixin methods
function test18_HotShotsChainingWithOtherMixins() {
  const logger: ILogLayer = new LogLayer({ transport: {} as any });

  // Should be able to chain hot-shots with other mixin methods
  logger
    .recordMetric('requests', 1)        // Metrics mixin
    .withTraceId('trace-123')           // Tracing mixin
    .stats.increment('api.calls').send();

  // getClient should be available
  const client = logger.getClient();
}

// Test 19: Hot-shots with method chaining and builder transition
function test19_HotShotsWithBuilderTransition() {
  const logger: ILogLayer = new LogLayer({ transport: {} as any });

  logger
    .withContext({ userId: 123 })
    .stats.increment('login').send();

  logger
    .withMetadata({ foo: 'bar' })       // Transition to builder
    .withTraceId('trace-123')           // Dual mixin should still work
    .info('test');
}

// Test 20: Hot-shots with MockLogLayer
function test20_HotShotsWithMockLogLayer() {
  const logger: ILogLayer = new MockLogLayer();

  // All hot-shots methods should work on MockLogLayer
  logger.stats.increment('counter').send();
  logger.stats.decrement('counter').send();
  logger.stats.gauge('gauge', 50).send();
  logger.stats.timing('timer', 100).send();
  logger.getClient();
}

// Test 21: Hot-shots with complex chaining
function test21_HotShotsComplexChaining() {
  const logger: ILogLayer = new LogLayer({ transport: {} as any });

  logger
    .recordMetric('requests', 1)
    .withTraceId('trace-123')
    .stats.increment('api.calls').send();

  logger
    .child()
    .withPrefix('API')
    .stats.gauge('active_connections', 10).send();
}

// Test 22: Hot-shots builder methods with tags and options
function test22_HotShotsBuilderMethods() {
  const logger: ILogLayer = new LogLayer({ transport: {} as any });

  // Test builder methods with chaining
  logger.stats
    .increment('counter')
    .withTags(['env:prod', 'service:api'])
    .withSampleRate(0.5)
    .send();

  logger.stats
    .gauge('memory', 1024)
    .withTags({ environment: 'production' })
    .send();

  logger.stats
    .timing('response_time', 250)
    .withCallback((err, bytes) => {
      console.log('Metric sent', err, bytes);
    })
    .send();
}

// Test 23: Intersection type with ILogLayer and single mixin
function test23_IntersectionTypeWithSingleMixin() {
  type LogLayerWithMetrics = ILogLayer & IMetricsMixin<ILogLayer>;

  const logger: LogLayerWithMetrics = new LogLayer({ transport: {} as any }) as LogLayerWithMetrics;

  // Mixin methods should be available
  logger.recordMetric('test', 100);
  logger.incrementCounter('counter');

  // Method chaining should work
  logger
    .withContext({ userId: 123 })
    .recordMetric('requests', 1)
    .info('test');
}

// Test 24: Intersection type with ILogLayer and multiple mixins
function test24_IntersectionTypeWithMultipleMixins() {
  type LogLayerWithMixins = ILogLayer & IMetricsMixin<ILogLayer> & ITracingMixin<ILogLayer>;

  const logger: LogLayerWithMixins = new LogLayer({ transport: {} as any }) as LogLayerWithMixins;

  // All mixin methods should be available
  logger.recordMetric('test', 100);
  logger.withTraceId('trace-123');
  logger.withSpanId('span-456');

  // Method chaining should preserve all types
  logger
    .recordMetric('requests', 1)
    .withTraceId('trace-123')
    .incrementCounter('api-calls')
    .withSpanId('span-456')
    .info('test');
}

// Test 25: Intersection type with ILogBuilder and mixins
function test25_IntersectionTypeWithILogBuilder() {
  type LogBuilderWithMixins = ILogBuilder & ITracingMixin<ILogBuilder>;

  const logger: ILogLayer = new LogLayer({ transport: {} as any });
  const builder: LogBuilderWithMixins = logger.withMetadata({ foo: 'bar' }) as LogBuilderWithMixins;

  // Mixin methods should be available on builder
  builder
    .withTraceId('trace-123')
    .withSpanId('span-456')
    .withError(new Error('test'))
    .info('test');
}

// Test 26: Factory function returning intersection type
function test26_FactoryFunctionWithIntersectionType() {
  type LogLayerWithAllMixins = ILogLayer &
    IMetricsMixin<ILogLayer> &
    ITracingMixin<ILogLayer> &
    IHotShotsMixin<ILogLayer>;

  function createLogger(): LogLayerWithAllMixins {
    return new LogLayer({ transport: {} as any }) as LogLayerWithAllMixins;
  }

  const logger = createLogger();

  // All mixin methods should be available
  logger.recordMetric('test', 100);
  logger.withTraceId('trace-123');
  logger.stats.increment('counter').send();

  // Method chaining should work
  logger
    .recordMetric('requests', 1)
    .withTraceId('trace-123')
    .withSpanId('span-456')
    .info('test');
}

// Test 27: Intersection type with child logger
function test27_IntersectionTypeWithChildLogger() {
  type LogLayerWithMixins = ILogLayer & IMetricsMixin<ILogLayer> & ITracingMixin<ILogLayer>;

  const logger: LogLayerWithMixins = new LogLayer({ transport: {} as any }) as LogLayerWithMixins;

  // Child should also support intersection type operations
  const child = logger.child();

  child
    .recordMetric('child-metric', 50)
    .withTraceId('child-trace')
    .info('child message');
}

// Test 28: Mixed usage - intersection types and automatic inference
function test28_MixedIntersectionAndAutoInference() {
  // Automatic inference
  const autoLogger: ILogLayer = new LogLayer({ transport: {} as any });

  autoLogger
    .recordMetric('auto', 1)
    .withTraceId('trace-auto')
    .info('auto');

  // Explicit intersection type
  type ExplicitLogger = ILogLayer & IMetricsMixin<ILogLayer>;
  const explicitLogger: ExplicitLogger = new LogLayer({ transport: {} as any }) as ExplicitLogger;

  explicitLogger
    .recordMetric('explicit', 1)
    .withTraceId('trace-explicit')  // Still works due to declaration merging
    .info('explicit');

  // Both should work the same way
}

// Export a dummy value to make this a module
export const typeTestsComplete = true;
