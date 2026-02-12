import type { BufferedMetricsLogger } from "datadog-metrics";
import type { HistogramOptions, IHistogramBuilder, IIncrementBuilder, IMetricsAPI, IMetricsBuilder } from "./types.js";

/**
 * Base class for mock metrics builders.
 * Provides no-op implementations of common builder methods.
 */
abstract class MockCommonMetricsBuilder implements IMetricsBuilder {
  withTags(_tags: string[]): this {
    return this;
  }

  withTimestamp(_timestamp: number): this {
    return this;
  }

  send(): void {
    // No-op
  }
}

/**
 * Mock implementation of IncrementBuilder.
 * Does nothing when methods are called.
 */
export class MockIncrementBuilder extends MockCommonMetricsBuilder implements IIncrementBuilder {
  constructor(_key: string) {
    super();
  }

  withValue(_value: number): this {
    return this;
  }
}

/**
 * Mock implementation of GaugeBuilder.
 * Does nothing when methods are called.
 */
export class MockGaugeBuilder extends MockCommonMetricsBuilder {
  constructor(_key: string, _value: number) {
    super();
  }
}

/**
 * Mock implementation of HistogramBuilder.
 * Does nothing when methods are called.
 */
export class MockHistogramBuilder extends MockCommonMetricsBuilder implements IHistogramBuilder {
  constructor(_key: string, _value: number) {
    super();
  }

  withHistogramOptions(_options: HistogramOptions): this {
    return this;
  }
}

/**
 * Mock implementation of DistributionBuilder.
 * Does nothing when methods are called.
 */
export class MockDistributionBuilder extends MockCommonMetricsBuilder {
  constructor(_key: string, _value: number) {
    super();
  }
}

/**
 * No-op implementation of IMetricsAPI.
 * All methods return mock builder instances that do nothing when send() is called.
 * This is used when datadogMetricsMixin(null) is called, allowing the metrics API
 * to be used without actually sending any metrics.
 */
export class MockMetricsAPI implements IMetricsAPI {
  increment(key: string): IIncrementBuilder {
    return new MockIncrementBuilder(key);
  }

  gauge(key: string, value: number): IMetricsBuilder {
    return new MockGaugeBuilder(key, value);
  }

  histogram(key: string, value: number): IHistogramBuilder {
    return new MockHistogramBuilder(key, value);
  }

  distribution(key: string, value: number): IMetricsBuilder {
    return new MockDistributionBuilder(key, value);
  }

  flush(): Promise<void> {
    return Promise.resolve();
  }

  start(): void {
    // No-op
  }

  stop(_options?: { flush?: boolean }): Promise<void> {
    return Promise.resolve();
  }

  getClient(): BufferedMetricsLogger {
    return {
      gauge: () => {},
      increment: () => {},
      histogram: () => {},
      distribution: () => {},
      flush: () => Promise.resolve(),
      start: () => {},
      stop: () => Promise.resolve(),
    } as unknown as BufferedMetricsLogger;
  }
}
