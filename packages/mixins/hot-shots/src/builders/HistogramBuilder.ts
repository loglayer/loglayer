import type { StatsD } from "hot-shots";
import { CommonStatsBuilder } from "../CommonStatsBuilder.js";
import type { StatsCallback } from "../types.js";

/**
 * Builder for the histogram method (DataDog/Telegraf only).
 * Supports chaining with withTags(), withSampleRate(), and withCallback().
 */
export class HistogramBuilder extends CommonStatsBuilder {
  /** The stat name(s) to record */
  private readonly stat: string | string[];
  /** The histogram value */
  private readonly value: number;

  /**
   * Creates a new HistogramBuilder instance.
   *
   * @param client - The hot-shots StatsD client instance
   * @param stat - The stat name(s) to record. Can be a single string or an array of strings.
   * @param value - The histogram value to record
   */
  constructor(client: StatsD, stat: string | string[], value: number) {
    super(client);
    this.stat = stat;
    this.value = value;
  }

  /**
   * Send the histogram metric with the configured options.
   */
  send(): void {
    const callArgs = this.buildStandardArgs(this.stat, this.value);
    this.client.histogram(...(callArgs as [string | string[], number, number?, string[]?, StatsCallback?]));
  }
}
