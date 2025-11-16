import { CommonStatsBuilder } from "../CommonStatsBuilder.js";
import type { StatsCallback, StatsDClient } from "../types.js";

/**
 * Builder for the timing method.
 * Supports chaining with withTags(), withSampleRate(), and withCallback().
 */
export class TimingBuilder extends CommonStatsBuilder {
  /** The stat name(s) to record */
  private readonly stat: string | string[];
  /** The timing value in milliseconds, or a Date object */
  private readonly value: number | Date;

  /**
   * Creates a new TimingBuilder instance.
   *
   * @param client - The hot-shots StatsD client instance
   * @param stat - The stat name(s) to record. Can be a single string or an array of strings.
   * @param value - The timing value in milliseconds, or a Date object (difference from now will be calculated)
   */
  constructor(client: StatsDClient, stat: string | string[], value: number | Date) {
    super(client);
    this.stat = stat;
    this.value = value;
  }

  /**
   * Send the timing metric with the configured options.
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

    this.client.timing(...(callArgs as [string | string[], number | Date, number?, string[]?, StatsCallback?]));
  }
}
