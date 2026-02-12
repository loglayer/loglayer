import type { BufferedMetricsLogger } from "datadog-metrics";
import { DistributionBuilder } from "./builders/DistributionBuilder.js";
import { GaugeBuilder } from "./builders/GaugeBuilder.js";
import { HistogramBuilder } from "./builders/HistogramBuilder.js";
import { IncrementBuilder } from "./builders/IncrementBuilder.js";
import type { IHistogramBuilder, IIncrementBuilder, IMetricsAPI, IMetricsBuilder } from "./types.js";

/**
 * Metrics API implementation that wraps datadog-metrics BufferedMetricsLogger.
 * Provides a fluent interface for sending metrics to Datadog via HTTP.
 */
export class MetricsAPI implements IMetricsAPI {
  /**
   * Creates a new MetricsAPI instance.
   *
   * @param client - The datadog-metrics BufferedMetricsLogger instance
   */
  constructor(private readonly client: BufferedMetricsLogger) {}

  /**
   * Increment a counter metric.
   * Returns a builder that supports chaining with withValue(), withTags(), and withTimestamp().
   *
   * @param key - The metric key to increment
   * @returns A builder instance for chaining additional options
   */
  increment(key: string): IIncrementBuilder {
    return new IncrementBuilder(this.client, key);
  }

  /**
   * Set a gauge metric to a specific value.
   * Returns a builder that supports chaining with withTags() and withTimestamp().
   *
   * @param key - The metric key to set
   * @param value - The value to set the gauge to
   * @returns A builder instance for chaining additional options
   */
  gauge(key: string, value: number): IMetricsBuilder {
    return new GaugeBuilder(this.client, key, value);
  }

  /**
   * Record a histogram value.
   * Returns a builder that supports chaining with withTags(), withTimestamp(), and withHistogramOptions().
   *
   * @param key - The metric key to record
   * @param value - The histogram value to record
   * @returns A builder instance for chaining additional options
   */
  histogram(key: string, value: number): IHistogramBuilder {
    return new HistogramBuilder(this.client, key, value);
  }

  /**
   * Record a distribution value (server-side calculated).
   * Returns a builder that supports chaining with withTags() and withTimestamp().
   *
   * @param key - The metric key to record
   * @param value - The distribution value to record
   * @returns A builder instance for chaining additional options
   */
  distribution(key: string, value: number): IMetricsBuilder {
    return new DistributionBuilder(this.client, key, value);
  }

  /**
   * Flush all buffered metrics to Datadog immediately.
   *
   * @returns A promise that resolves when the flush completes
   */
  flush(): Promise<void> {
    return this.client.flush();
  }

  /**
   * Start auto-flushing metrics at the configured interval.
   */
  start(): void {
    this.client.start();
  }

  /**
   * Stop auto-flushing and optionally flush remaining metrics.
   *
   * @param options - Options for stopping. `flush` defaults to true.
   * @returns A promise that resolves when stopping completes
   */
  stop(options?: { flush?: boolean }): Promise<void> {
    return this.client.stop(options);
  }

  /**
   * Get the underlying BufferedMetricsLogger instance.
   *
   * @returns The BufferedMetricsLogger instance
   */
  getClient(): BufferedMetricsLogger {
    return this.client;
  }
}
