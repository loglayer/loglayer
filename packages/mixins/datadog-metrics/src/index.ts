import { BufferedMetricsLogger } from "datadog-metrics";
import type { LogLayerMixinRegistration } from "loglayer";
import { setMetricsClient } from "./client.js";
import { logLayerDatadogMetricsMixin } from "./LogLayer.augment.js";
import type { DatadogMetricsOptions } from "./types.js";
import "./types.js"; // Import types to ensure declarations are processed

export type { BufferedMetricsLogger } from "datadog-metrics";
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

/**
 * Register the datadog-metrics mixin with LogLayer.
 * This adds a `ddStats` property to LogLayer instances,
 * providing a fluent API for sending metrics to Datadog via HTTP.
 *
 * @param options - The BufferedMetricsLogger configuration options, or null for no-op mode
 * @returns A LogLayer mixin registration object
 *
 * @example
 * ```typescript
 * import { useLogLayerMixin } from 'loglayer';
 * import { datadogMetricsMixin } from '@loglayer/mixin-datadog-metrics';
 *
 * useLogLayerMixin(datadogMetricsMixin({
 *   apiKey: 'your-api-key',
 *   prefix: 'myapp.',
 *   flushIntervalSeconds: 15,
 * }));
 * ```
 */
export function datadogMetricsMixin(options: DatadogMetricsOptions | null): LogLayerMixinRegistration {
  if (options) {
    const client = new BufferedMetricsLogger(options);
    setMetricsClient(client);
  } else {
    setMetricsClient(null);
  }

  return {
    mixinsToAdd: [logLayerDatadogMetricsMixin],
    pluginsToAdd: [],
  };
}
