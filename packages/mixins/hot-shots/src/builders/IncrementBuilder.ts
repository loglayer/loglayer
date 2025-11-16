import { CommonStatsBuilder } from "../CommonStatsBuilder.js";
import type { IIncrementDecrementBuilder, StatsCallback, StatsDClient } from "../types.js";

/**
 * Builder for the increment method.
 * Supports chaining with withValue(), withTags(), withSampleRate(), and withCallback().
 */
export class IncrementBuilder extends CommonStatsBuilder implements IIncrementDecrementBuilder {
  /** The stat name(s) to increment */
  private readonly stat: string | string[];
  /** The increment value (optional, defaults to 1) */
  private value?: number;

  /**
   * Creates a new IncrementBuilder instance.
   *
   * @param client - The hot-shots StatsD client instance
   * @param stat - The stat name(s) to increment. Can be a single string or an array of strings.
   */
  constructor(client: StatsDClient, stat: string | string[]) {
    super(client);
    this.stat = stat;
  }

  /**
   * Set the increment value.
   *
   * @param value - The value to increment by (defaults to 1 if not specified)
   * @returns The builder instance for method chaining
   */
  withValue(value: number): IIncrementDecrementBuilder {
    this.value = value;
    return this;
  }

  /**
   * Send the increment metric with the configured options.
   */
  send(): void {
    const callArgs = this.buildStandardArgs(this.stat, this.value);
    this.client.increment(...(callArgs as [string | string[], number?, number?, string[]?, StatsCallback?]));
  }
}
