import { CommonStatsBuilder } from "../CommonStatsBuilder.js";
import type { StatsCallback, StatsDClient } from "../types.js";

/**
 * Builder for the unique method (alias of set).
 * Supports chaining with withTags(), withSampleRate(), and withCallback().
 */
export class UniqueBuilder extends CommonStatsBuilder {
  /** The stat name(s) to record */
  private readonly stat: string | string[];
  /** The unique value to record */
  private readonly value: string | number;

  /**
   * Creates a new UniqueBuilder instance.
   *
   * @param client - The hot-shots StatsD client instance
   * @param stat - The stat name(s) to record. Can be a single string or an array of strings.
   * @param value - The unique value to record (string or number)
   */
  constructor(client: StatsDClient, stat: string | string[], value: string | number) {
    super(client);
    this.stat = stat;
    this.value = value;
  }

  /**
   * Send the unique metric with the configured options.
   */
  send(): void {
    const callArgs: unknown[] = [this.stat, this.value];

    // Build arguments in the correct order
    if (this.sampleRate !== undefined) {
      callArgs.push(this.sampleRate);
    }

    const finalTags = this.convertTags();
    if (finalTags) {
      callArgs.push(finalTags);
    }

    if (this.callback) {
      callArgs.push(this.callback);
    }

    this.client.unique(...(callArgs as [string | string[], string | number, number?, string[]?, StatsCallback?]));
  }
}
