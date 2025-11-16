import type { CheckOptions, DatadogChecksValues } from "hot-shots";
import { CommonStatsBuilder } from "./CommonStatsBuilder.js";
import type { ICheckBuilder, StatsCallback, StatsDClient } from "./types.js";

/**
 * Builder for the check method that supports withOptions().
 * Used for sending service checks to DataDog.
 */
export class CheckBuilder extends CommonStatsBuilder implements ICheckBuilder {
  /** Service check options (hostname, timestamp, message, etc.) */
  private options?: CheckOptions;
  /** The service check name */
  private readonly name: string;
  /** The service check status */
  private readonly status: DatadogChecksValues;

  /**
   * Creates a new CheckBuilder instance.
   *
   * @param client - The hot-shots StatsD client instance
   * @param name - The service check name
   * @param status - The service check status (OK, WARNING, CRITICAL, UNKNOWN)
   */
  constructor(client: StatsDClient, name: string, status: DatadogChecksValues) {
    super(client);
    this.name = name;
    this.status = status;
  }

  /**
   * Set service check options.
   *
   * @param options - Service check options (hostname, timestamp, message, etc.)
   * @returns The builder instance for method chaining
   */
  withOptions(options: CheckOptions): CheckBuilder {
    this.options = options;
    return this;
  }

  /**
   * Sample rate is not supported for check method.
   * This method is a no-op but exists for API consistency.
   *
   * @param _rate - Ignored parameter
   * @returns The builder instance for method chaining
   */
  withSampleRate(_rate: number): CheckBuilder {
    // Sample rate is not supported for check method
    return this;
  }

  /**
   * Send the service check with the configured options.
   */
  send(): void {
    // check(name, status, options?, tags?, callback?)
    const callArgs: unknown[] = [this.name, this.status];

    if (this.options !== undefined) {
      callArgs.push(this.options);
    }

    const finalTags = this.convertTags();
    if (finalTags) {
      callArgs.push(finalTags);
    }

    if (this.callback) {
      callArgs.push(this.callback);
    }

    this.client.check(...(callArgs as [string, DatadogChecksValues, CheckOptions?, string[]?, StatsCallback?]));
  }
}
