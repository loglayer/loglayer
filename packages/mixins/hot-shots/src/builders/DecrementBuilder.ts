import { CommonStatsBuilder } from "../CommonStatsBuilder.js";
import type { IIncrementDecrementBuilder, StatsCallback, StatsDClient } from "../types.js";

/**
 * Builder for the decrement method.
 * Supports chaining with withValue(), withTags(), withSampleRate(), and withCallback().
 */
export class DecrementBuilder extends CommonStatsBuilder implements IIncrementDecrementBuilder {
  /** The stat name(s) to decrement */
  private readonly stat: string | string[];
  /** The decrement value (optional, defaults to 1) */
  private value?: number;

  /**
   * Creates a new DecrementBuilder instance.
   *
   * @param client - The hot-shots StatsD client instance
   * @param stat - The stat name(s) to decrement. Can be a single string or an array of strings.
   */
  constructor(client: StatsDClient, stat: string | string[]) {
    super(client);
    this.stat = stat;
  }

  /**
   * Set the decrement value.
   *
   * @param value - The value to decrement by (defaults to 1 if not specified)
   * @returns The builder instance for method chaining
   */
  withValue(value: number): IIncrementDecrementBuilder {
    this.value = value;
    return this;
  }

  /**
   * Send the decrement metric with the configured options.
   */
  send(): void {
    const callArgs = this.buildStandardArgs(this.stat, this.value);
    this.client.decrement(...(callArgs as [string | string[], number?, number?, string[]?, StatsCallback?]));
  }
}
