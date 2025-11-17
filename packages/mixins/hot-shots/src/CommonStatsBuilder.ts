import type { StatsD } from "hot-shots";
import type { IStatsBuilder, StatsCallback, StatsTags } from "./types.js";

/**
 * Base class for common stats builder functionality.
 * Provides shared methods for configuring tags, sample rate, and callbacks.
 */
export abstract class CommonStatsBuilder implements IStatsBuilder {
  /** Tags to attach to the metric */
  protected tags?: StatsTags;
  /** Sample rate for the metric (0.0 to 1.0) */
  protected sampleRate?: number;
  /** Callback function to call after sending the metric */
  protected callback?: StatsCallback;
  /** The hot-shots client instance */
  protected readonly client: StatsD;

  /**
   * Creates a new CommonStatsBuilder instance.
   *
   * @param client - The hot-shots StatsD client instance
   */
  constructor(client: StatsD) {
    this.client = client;
  }

  /**
   * Add tags to the metric.
   *
   * @param tags - Tags as an array of strings or an object (e.g., { env: 'prod' } becomes ['env:prod'])
   * @returns The builder instance for method chaining
   */
  withTags(tags: StatsTags): IStatsBuilder {
    this.tags = tags;
    return this;
  }

  /**
   * Set the sample rate for the metric.
   * The StatsD daemon will compensate for sampling.
   *
   * @param rate - Sample rate between 0.0 and 1.0 (e.g., 0.5 = 50% sampling)
   * @returns The builder instance for method chaining
   */
  withSampleRate(rate: number): IStatsBuilder {
    this.sampleRate = rate;
    return this;
  }

  /**
   * Add a callback function to be called after sending the metric.
   *
   * @param callback - Function called with (error?, bytes?) after the metric is sent
   * @returns The builder instance for method chaining
   */
  withCallback(callback: StatsCallback): IStatsBuilder {
    this.callback = callback;
    return this;
  }

  /**
   * Convert tags to the format hot-shots expects (array of strings)
   */
  protected convertTags(): string[] | undefined {
    if (!this.tags) {
      return undefined;
    }

    if (Array.isArray(this.tags)) {
      return this.tags;
    }

    // Convert object to array format: ["key:value", "key2:value2"]
    return Object.entries(this.tags).map(([key, value]) => `${key}:${value}`);
  }

  /**
   * Build arguments array for standard methods: method(stat, value?, sampleRate?, tags?, callback?)
   */
  protected buildStandardArgs(stat: string | string[], value?: number): unknown[] {
    const callArgs: unknown[] = [stat];

    // Include value if provided
    if (value !== undefined) {
      callArgs.push(value);
    }

    // Build arguments in the correct order
    if (this.sampleRate !== undefined) {
      // If sampleRate is provided, it goes after value but before tags
      callArgs.push(this.sampleRate);
    }

    const finalTags = this.convertTags();
    if (finalTags) {
      callArgs.push(finalTags);
    }

    if (this.callback) {
      callArgs.push(this.callback);
    }

    return callArgs;
  }

  /**
   * Abstract method that each builder must implement to send the metric
   */
  abstract send(): void;
}
