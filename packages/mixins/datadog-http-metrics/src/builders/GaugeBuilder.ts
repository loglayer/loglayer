import type { BufferedMetricsLogger } from "datadog-metrics";
import { CommonMetricsBuilder } from "../CommonMetricsBuilder.js";

/**
 * Builder for the gauge method.
 * Supports chaining with withTags() and withTimestamp().
 */
export class GaugeBuilder extends CommonMetricsBuilder {
  /** The metric key */
  private readonly key: string;
  /** The gauge value */
  private readonly value: number;

  /**
   * Creates a new GaugeBuilder instance.
   *
   * @param client - The datadog-metrics BufferedMetricsLogger instance
   * @param key - The metric key to set
   * @param value - The value to set the gauge to
   */
  constructor(client: BufferedMetricsLogger, key: string, value: number) {
    super(client);
    this.key = key;
    this.value = value;
  }

  /**
   * Send the gauge metric with the configured options.
   */
  send(): void {
    this.client.gauge(this.key, this.value, this.tags, this.timestamp);
  }
}
