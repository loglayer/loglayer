import type { BufferedMetricsLogger } from "datadog-metrics";
import { CommonMetricsBuilder } from "../CommonMetricsBuilder.js";

/**
 * Builder for the distribution method.
 * Supports chaining with withTags() and withTimestamp().
 */
export class DistributionBuilder extends CommonMetricsBuilder {
  /** The metric key */
  private readonly key: string;
  /** The distribution value */
  private readonly value: number;

  /**
   * Creates a new DistributionBuilder instance.
   *
   * @param client - The datadog-metrics BufferedMetricsLogger instance
   * @param key - The metric key to record
   * @param value - The distribution value to record
   */
  constructor(client: BufferedMetricsLogger, key: string, value: number) {
    super(client);
    this.key = key;
    this.value = value;
  }

  /**
   * Send the distribution metric with the configured options.
   */
  send(): void {
    this.client.distribution(this.key, this.value, this.tags, this.timestamp);
  }
}
