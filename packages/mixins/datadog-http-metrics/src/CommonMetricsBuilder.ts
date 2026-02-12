import type { BufferedMetricsLogger } from "datadog-metrics";
import type { IMetricsBuilder } from "./types.js";

/**
 * Base class for common metrics builder functionality.
 * Provides shared methods for configuring tags and timestamp.
 */
export abstract class CommonMetricsBuilder implements IMetricsBuilder {
  /** Tags to attach to the metric */
  protected tags?: string[];
  /** Timestamp in milliseconds since epoch */
  protected timestamp?: number;
  /** The datadog-metrics client instance */
  protected readonly client: BufferedMetricsLogger;

  /**
   * Creates a new CommonMetricsBuilder instance.
   *
   * @param client - The datadog-metrics BufferedMetricsLogger instance
   */
  constructor(client: BufferedMetricsLogger) {
    this.client = client;
  }

  /**
   * Add tags to the metric.
   *
   * @param tags - Tags as an array of strings (e.g., ['env:prod', 'service:api'])
   * @returns The builder instance for method chaining
   */
  withTags(tags: string[]): this {
    this.tags = tags;
    return this;
  }

  /**
   * Set the timestamp for the metric.
   *
   * @param timestamp - Timestamp in milliseconds since epoch
   * @returns The builder instance for method chaining
   */
  withTimestamp(timestamp: number): this {
    this.timestamp = timestamp;
    return this;
  }

  /**
   * Abstract method that each builder must implement to send the metric
   */
  abstract send(): void;
}
