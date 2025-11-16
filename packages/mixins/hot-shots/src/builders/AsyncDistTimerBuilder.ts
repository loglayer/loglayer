import { CommonStatsBuilder } from "../CommonStatsBuilder.js";
import type { IAsyncDistTimerBuilder, StatsCallback, StatsDClient, StatsTags } from "../types.js";

/**
 * Builder for the asyncDistTimer method.
 * Supports chaining with withTags(), withSampleRate(), and withCallback().
 * Returns a wrapped function via create() that automatically times async function execution as a distribution metric.
 */
export class AsyncDistTimerBuilder extends CommonStatsBuilder implements IAsyncDistTimerBuilder {
  /** The async function to wrap */
  private readonly func: (...args: unknown[]) => Promise<unknown>;
  /** The stat name(s) to record timing to */
  private readonly stat: string | string[];

  /**
   * Creates a new AsyncDistTimerBuilder instance.
   *
   * @param client - The hot-shots StatsD client instance
   * @param func - The async function to wrap
   * @param stat - The stat name(s) to record timing to. Can be a single string or an array of strings.
   */
  constructor(client: StatsDClient, func: (...args: unknown[]) => Promise<unknown>, stat: string | string[]) {
    super(client);
    this.func = func;
    this.stat = stat;
  }

  /**
   * Add tags to the metric.
   *
   * @param tags - Tags as an array of strings or an object
   * @returns The builder instance for method chaining
   */
  withTags(tags: StatsTags): IAsyncDistTimerBuilder {
    this.tags = tags;
    return this;
  }

  /**
   * Set the sample rate for the metric.
   *
   * @param rate - Sample rate between 0.0 and 1.0
   * @returns The builder instance for method chaining
   */
  withSampleRate(rate: number): IAsyncDistTimerBuilder {
    this.sampleRate = rate;
    return this;
  }

  /**
   * Add a callback function to be called after sending the metric.
   *
   * @param callback - Function called with (error?, bytes?) after the metric is sent
   * @returns The builder instance for method chaining
   */
  withCallback(callback: StatsCallback): IAsyncDistTimerBuilder {
    this.callback = callback;
    return this;
  }

  /**
   * Create the wrapped async function that will automatically time its execution as a distribution metric.
   * @returns The wrapped function that records timing when executed
   */
  create<P extends unknown[], R>(): (...args: P) => Promise<R> {
    const finalTags = this.convertTags();

    // Build arguments array - hot-shots parameter order: func, stat, sampleRate?, tags?, callback?
    if (this.callback !== undefined) {
      return this.client.asyncDistTimer(this.func, this.stat, this.sampleRate, finalTags, this.callback) as (
        ...args: P
      ) => Promise<R>;
    }
    if (finalTags) {
      return this.client.asyncDistTimer(this.func, this.stat, this.sampleRate, finalTags) as (...args: P) => Promise<R>;
    }
    if (this.sampleRate !== undefined) {
      return this.client.asyncDistTimer(this.func, this.stat, this.sampleRate) as (...args: P) => Promise<R>;
    }
    return this.client.asyncDistTimer(this.func, this.stat) as (...args: P) => Promise<R>;
  }

  /**
   * Send is not supported for async dist timer builders.
   * Use create() to get the wrapped function instead.
   */
  send(): void {
    // No-op - async dist timer builders use create() instead
  }
}
