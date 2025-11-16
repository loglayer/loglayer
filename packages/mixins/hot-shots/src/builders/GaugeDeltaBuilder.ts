import { CommonStatsBuilder } from "../CommonStatsBuilder.js";
import type { StatsCallback, StatsDClient } from "../types.js";

/**
 * Builder for the gaugeDelta method.
 * Supports chaining with withTags(), withSampleRate(), and withCallback().
 */
export class GaugeDeltaBuilder extends CommonStatsBuilder {
  /** The stat name(s) to modify */
  private readonly stat: string | string[];
  /** The delta amount to change the gauge by */
  private readonly delta: number;

  /**
   * Creates a new GaugeDeltaBuilder instance.
   *
   * @param client - The hot-shots StatsD client instance
   * @param stat - The stat name(s) to modify. Can be a single string or an array of strings.
   * @param delta - The amount to change the gauge by (can be positive or negative)
   */
  constructor(client: StatsDClient, stat: string | string[], delta: number) {
    super(client);
    this.stat = stat;
    this.delta = delta;
  }

  /**
   * Send the gaugeDelta metric with the configured options.
   */
  send(): void {
    const callArgs = this.buildStandardArgs(this.stat, this.delta);
    this.client.gaugeDelta(...(callArgs as [string | string[], number, number?, string[]?, StatsCallback?]));
  }
}
