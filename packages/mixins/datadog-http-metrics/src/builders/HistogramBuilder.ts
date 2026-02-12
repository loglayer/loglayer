import type { BufferedMetricsLogger } from "datadog-metrics";
import { CommonMetricsBuilder } from "../CommonMetricsBuilder.js";
import type { HistogramOptions, IHistogramBuilder } from "../types.js";

/**
 * Builder for the histogram method.
 * Supports chaining with withTags(), withTimestamp(), and withHistogramOptions().
 */
export class HistogramBuilder extends CommonMetricsBuilder implements IHistogramBuilder {
  /** The metric key */
  private readonly key: string;
  /** The histogram value */
  private readonly value: number;
  /** Optional histogram-specific options */
  private histogramOptions?: HistogramOptions;

  /**
   * Creates a new HistogramBuilder instance.
   *
   * @param client - The datadog-metrics BufferedMetricsLogger instance
   * @param key - The metric key to record
   * @param value - The histogram value to record
   */
  constructor(client: BufferedMetricsLogger, key: string, value: number) {
    super(client);
    this.key = key;
    this.value = value;
  }

  /**
   * Set histogram-specific options for aggregation and percentiles.
   *
   * @param options - Histogram options with aggregates and/or percentiles
   * @returns The builder instance for method chaining
   */
  withHistogramOptions(options: HistogramOptions): IHistogramBuilder {
    this.histogramOptions = options;
    return this;
  }

  /**
   * Send the histogram metric with the configured options.
   */
  send(): void {
    this.client.histogram(this.key, this.value, this.tags, this.timestamp, this.histogramOptions);
  }
}
