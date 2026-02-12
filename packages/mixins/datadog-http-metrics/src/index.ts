import metrics from "datadog-metrics";
import type { LogLayerMixinRegistration } from "loglayer";
import { setMetricsClient } from "./client.js";
import { logLayerDatadogMetricsMixin } from "./LogLayer.augment.js";
import type { DatadogMetricsOptions } from "./types.js";
import "./types.js"; // Import types to ensure declarations are processed

export { MetricsAPI } from "./MetricsAPI.js";
export { MockMetricsAPI } from "./MockMetricsAPI.js";
export type {
  DatadogMetricsOptions,
  HistogramOptions,
  IDatadogMetricsMixin,
  IHistogramBuilder,
  IIncrementBuilder,
  IMetricsAPI,
  IMetricsBuilder,
} from "./types.js";

// Re-export from datadog-metrics so users don't need to install it directly
export const BufferedMetricsLogger = metrics.BufferedMetricsLogger;
export type { BufferedMetricsLoggerOptions } from "datadog-metrics";

/**
 * A reporter that discards all metrics. Useful for testing or temporarily
 * disabling metric submission without using the `enabled` flag.
 * Re-exported from the `datadog-metrics` library.
 */
export const NullReporter = metrics.reporters.NullReporter;

/**
 * The default reporter that sends metrics to Datadog's HTTP API with automatic retries.
 * Re-exported from the `datadog-metrics` library.
 */
export const DatadogReporter = metrics.reporters.DatadogReporter;

/**
 * Register the datadog-metrics mixin with LogLayer.
 * This adds a `ddStats` property to LogLayer instances,
 * providing a fluent API for sending metrics to Datadog via HTTP.
 *
 * @param options - The BufferedMetricsLogger configuration options, or null for no-op mode.
 *   Set `enabled: false` to use no-op mode while still passing options.
 * @returns A LogLayer mixin registration object
 *
 * @example
 * ```typescript
 * import { useLogLayerMixin } from 'loglayer';
 * import { datadogMetricsMixin } from '@loglayer/mixin-datadog-http-metrics';
 *
 * useLogLayerMixin(datadogMetricsMixin({
 *   apiKey: 'your-api-key',
 *   prefix: 'myapp.',
 *   enabled: process.env.NODE_ENV === 'production',
 * }));
 * ```
 */
export function datadogMetricsMixin(
  options: (DatadogMetricsOptions & { enabled?: boolean }) | null,
): LogLayerMixinRegistration {
  if (options && options.enabled !== false) {
    const { enabled: _, ...metricsOptions } = options;
    const client = new metrics.BufferedMetricsLogger({
      flushIntervalSeconds: 5,
      ...metricsOptions,
    });
    setMetricsClient(client);
  } else {
    setMetricsClient(null);
  }

  return {
    mixinsToAdd: [logLayerDatadogMetricsMixin],
    pluginsToAdd: [],
  };
}
