import type { BufferedMetricsLogger, BufferedMetricsLoggerOptions } from "datadog-metrics";

/**
 * Options for creating a BufferedMetricsLogger instance.
 * Re-exported from the datadog-metrics library for convenience.
 */
export type DatadogMetricsOptions = BufferedMetricsLoggerOptions;

/**
 * Histogram aggregation and percentile options
 */
export interface HistogramOptions {
  /** Aggregation types: 'max', 'min', 'sum', 'avg', 'count', 'median' */
  aggregates?: string[];
  /** Percentile values between 0 and 1, e.g. [0.95, 0.99] */
  percentiles?: number[];
}

/**
 * Builder interface for chaining metric configurations
 */
export interface IMetricsBuilder {
  /**
   * Add tags to the metric
   */
  withTags(tags: string[]): IMetricsBuilder;

  /**
   * Set the timestamp for the metric in milliseconds since epoch
   */
  withTimestamp(timestamp: number): IMetricsBuilder;

  /**
   * Send the metric with the configured options
   */
  send(): void;
}

/**
 * Builder interface for increment method with withValue support
 */
export interface IIncrementBuilder extends IMetricsBuilder {
  /**
   * Set the increment value (defaults to 1)
   */
  withValue(value: number): IIncrementBuilder;

  withTags(tags: string[]): IIncrementBuilder;
  withTimestamp(timestamp: number): IIncrementBuilder;
}

/**
 * Builder interface for histogram method with histogram options support
 */
export interface IHistogramBuilder extends IMetricsBuilder {
  /**
   * Set histogram-specific options (aggregates and percentiles)
   */
  withHistogramOptions(options: HistogramOptions): IHistogramBuilder;

  withTags(tags: string[]): IHistogramBuilder;
  withTimestamp(timestamp: number): IHistogramBuilder;
}

/**
 * Metrics API interface containing all datadog-metrics methods
 */
export interface IMetricsAPI {
  /**
   * Increment a counter metric
   */
  increment(key: string): IIncrementBuilder;

  /**
   * Set a gauge metric to a specific value
   */
  gauge(key: string, value: number): IMetricsBuilder;

  /**
   * Record a histogram value
   */
  histogram(key: string, value: number): IHistogramBuilder;

  /**
   * Record a distribution value (server-side calculated)
   */
  distribution(key: string, value: number): IMetricsBuilder;

  /**
   * Flush all buffered metrics to Datadog immediately
   */
  flush(): Promise<void>;

  /**
   * Start auto-flushing metrics at the configured interval
   */
  start(): void;

  /**
   * Stop auto-flushing and optionally flush remaining metrics
   */
  stop(options?: { flush?: boolean }): Promise<void>;

  /**
   * Get the underlying BufferedMetricsLogger instance
   */
  getClient(): BufferedMetricsLogger;
}

/**
 * Generic mixin interface for Datadog HTTP metrics methods.
 * T is the instance type (LogLayer or MockLogLayer).
 */
export interface IDatadogMetricsMixin<_T> {
  /**
   * Access to Datadog HTTP metrics API
   */
  ddStats: IMetricsAPI;
}

declare module "loglayer" {
  interface LogLayer extends IDatadogMetricsMixin<LogLayer> {}
  interface MockLogLayer extends IDatadogMetricsMixin<MockLogLayer> {}
  interface ILogLayer<This> extends IDatadogMetricsMixin<This> {}
}
