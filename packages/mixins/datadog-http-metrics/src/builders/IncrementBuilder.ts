import type { BufferedMetricsLogger } from "datadog-metrics";
import { CommonMetricsBuilder } from "../CommonMetricsBuilder.js";
import type { IIncrementBuilder } from "../types.js";

/**
 * Builder for the increment method.
 * Supports chaining with withValue(), withTags(), and withTimestamp().
 */
export class IncrementBuilder extends CommonMetricsBuilder implements IIncrementBuilder {
  /** The metric key */
  private readonly key: string;
  /** The increment value (optional, defaults to 1) */
  private value?: number;

  /**
   * Creates a new IncrementBuilder instance.
   *
   * @param client - The datadog-metrics BufferedMetricsLogger instance
   * @param key - The metric key to increment
   */
  constructor(client: BufferedMetricsLogger, key: string) {
    super(client);
    this.key = key;
  }

  /**
   * Set the increment value.
   *
   * @param value - The value to increment by (defaults to 1 if not specified)
   * @returns The builder instance for method chaining
   */
  withValue(value: number): IIncrementBuilder {
    this.value = value;
    return this;
  }

  /**
   * Send the increment metric with the configured options.
   */
  send(): void {
    this.client.increment(this.key, this.value, this.tags, this.timestamp);
  }
}
