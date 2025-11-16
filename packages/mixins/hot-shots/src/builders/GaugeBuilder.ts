import { CommonStatsBuilder } from "../CommonStatsBuilder.js";
import type { StatsCallback, StatsDClient } from "../types.js";

/**
 * Builder for the gauge method.
 * Supports chaining with withTags(), withSampleRate(), and withCallback().
 */
export class GaugeBuilder extends CommonStatsBuilder {
  /** The stat name(s) to set */
  private readonly stat: string | string[];
  /** The gauge value */
  private readonly value: number;

  /**
   * Creates a new GaugeBuilder instance.
   *
   * @param client - The hot-shots StatsD client instance
   * @param stat - The stat name(s) to set. Can be a single string or an array of strings.
   * @param value - The value to set the gauge to
   */
  constructor(client: StatsDClient, stat: string | string[], value: number) {
    super(client);
    this.stat = stat;
    this.value = value;
  }

  /**
   * Send the gauge metric with the configured options.
   */
  send(): void {
    const callArgs = this.buildStandardArgs(this.stat, this.value);
    this.client.gauge(...(callArgs as [string | string[], number, number?, string[]?, StatsCallback?]));
  }
}
