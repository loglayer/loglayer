import type { DatadogChecksValues } from "hot-shots";
import { AsyncDistTimerBuilder } from "./builders/AsyncDistTimerBuilder.js";
import { AsyncTimerBuilder } from "./builders/AsyncTimerBuilder.js";
import { DecrementBuilder } from "./builders/DecrementBuilder.js";
import { DistributionBuilder } from "./builders/DistributionBuilder.js";
import { EventBuilder } from "./builders/EventBuilder.js";
import { GaugeBuilder } from "./builders/GaugeBuilder.js";
import { GaugeDeltaBuilder } from "./builders/GaugeDeltaBuilder.js";
import { HistogramBuilder } from "./builders/HistogramBuilder.js";
import { IncrementBuilder } from "./builders/IncrementBuilder.js";
import { SetBuilder } from "./builders/SetBuilder.js";
import { TimerBuilder } from "./builders/TimerBuilder.js";
import { TimingBuilder } from "./builders/TimingBuilder.js";
import { UniqueBuilder } from "./builders/UniqueBuilder.js";
import { CheckBuilder } from "./CheckBuilder.js";
import type {
  IAsyncDistTimerBuilder,
  IAsyncTimerBuilder,
  ICheckBuilder,
  IEventBuilder,
  IIncrementDecrementBuilder,
  IStatsAPI,
  IStatsBuilder,
  ITimerBuilder,
  StatsDClient,
} from "./types.js";

/**
 * Stats API implementation that wraps hot-shots client.
 * Provides a fluent interface for sending metrics to StatsD, DogStatsD, and Telegraf.
 */
export class StatsAPI implements IStatsAPI {
  /**
   * Creates a new StatsAPI instance.
   *
   * @param client - The hot-shots StatsD client instance to use for sending metrics
   */
  constructor(private readonly client: StatsDClient) {}

  /**
   * Increment a counter metric.
   * Returns a builder that supports chaining with withValue(), withTags(), withSampleRate(), and withCallback().
   *
   * @param stat - The stat name(s) to increment. Can be a single string or an array of strings.
   * @returns A builder instance for chaining additional options
   */
  increment(stat: string | string[]): IIncrementDecrementBuilder {
    return new IncrementBuilder(this.client, stat);
  }

  /**
   * Decrement a counter metric.
   * Returns a builder that supports chaining with withValue(), withTags(), withSampleRate(), and withCallback().
   *
   * @param stat - The stat name(s) to decrement. Can be a single string or an array of strings.
   * @returns A builder instance for chaining additional options
   */
  decrement(stat: string | string[]): IIncrementDecrementBuilder {
    return new DecrementBuilder(this.client, stat);
  }

  /**
   * Set a gauge metric to a specific value.
   * Returns a builder that supports chaining with withTags(), withSampleRate(), and withCallback().
   *
   * @param stat - The stat name(s) to set. Can be a single string or an array of strings.
   * @param value - The value to set the gauge to
   * @returns A builder instance for chaining additional options
   */
  gauge(stat: string | string[], value: number): IStatsBuilder {
    return new GaugeBuilder(this.client, stat, value);
  }

  /**
   * Change a gauge metric by a delta amount.
   * Returns a builder that supports chaining with withTags(), withSampleRate(), and withCallback().
   *
   * @param stat - The stat name(s) to modify. Can be a single string or an array of strings.
   * @param delta - The amount to change the gauge by (can be positive or negative)
   * @returns A builder instance for chaining additional options
   */
  gaugeDelta(stat: string | string[], delta: number): IStatsBuilder {
    return new GaugeDeltaBuilder(this.client, stat, delta);
  }

  /**
   * Record a histogram value (DataDog/Telegraf only).
   * Returns a builder that supports chaining with withTags(), withSampleRate(), and withCallback().
   *
   * @param stat - The stat name(s) to record. Can be a single string or an array of strings.
   * @param value - The histogram value to record
   * @returns A builder instance for chaining additional options
   */
  histogram(stat: string | string[], value: number): IStatsBuilder {
    return new HistogramBuilder(this.client, stat, value);
  }

  /**
   * Record a distribution value (DataDog v6 only).
   * Returns a builder that supports chaining with withTags(), withSampleRate(), and withCallback().
   *
   * @param stat - The stat name(s) to record. Can be a single string or an array of strings.
   * @param value - The distribution value to record
   * @returns A builder instance for chaining additional options
   */
  distribution(stat: string | string[], value: number): IStatsBuilder {
    return new DistributionBuilder(this.client, stat, value);
  }

  /**
   * Record a timing value in milliseconds.
   * Returns a builder that supports chaining with withTags(), withSampleRate(), and withCallback().
   *
   * @param stat - The stat name(s) to record. Can be a single string or an array of strings.
   * @param value - The timing value in milliseconds, or a Date object (difference from now will be calculated)
   * @returns A builder instance for chaining additional options
   */
  timing(stat: string | string[], value: number | Date): IStatsBuilder {
    return new TimingBuilder(this.client, stat, value);
  }

  /**
   * Record a unique/set value.
   * Returns a builder that supports chaining with withTags(), withSampleRate(), and withCallback().
   *
   * @param stat - The stat name(s) to record. Can be a single string or an array of strings.
   * @param value - The unique value to record (string or number)
   * @returns A builder instance for chaining additional options
   */
  set(stat: string | string[], value: string | number): IStatsBuilder {
    return new SetBuilder(this.client, stat, value);
  }

  /**
   * Record a unique/set value (alias of set).
   * Returns a builder that supports chaining with withTags(), withSampleRate(), and withCallback().
   *
   * @param stat - The stat name(s) to record. Can be a single string or an array of strings.
   * @param value - The unique value to record (string or number)
   * @returns A builder instance for chaining additional options
   */
  unique(stat: string | string[], value: string | number): IStatsBuilder {
    return new UniqueBuilder(this.client, stat, value);
  }

  /**
   * Send an event (DataDog only).
   * Returns a builder that supports chaining with withText(), withTags(), and withCallback().
   *
   * @param title - The event title
   * @returns A builder instance for chaining additional options
   */
  event(title: string): IEventBuilder {
    return new EventBuilder(this.client, title);
  }

  /**
   * Send a service check (DataDog only).
   * Returns a builder that supports chaining with withOptions(), withTags(), and withCallback().
   *
   * @param name - The service check name
   * @param status - The service check status (OK, WARNING, CRITICAL, UNKNOWN)
   * @returns A builder instance for chaining additional options
   */
  check(name: string, status: DatadogChecksValues): ICheckBuilder {
    return new CheckBuilder(this.client, name, status);
  }

  /**
   * Wrap an async function to automatically time its execution.
   * Returns a builder that supports chaining with withTags(), withSampleRate(), and withCallback().
   * Call create() to get the wrapped function.
   *
   * @param func - The async function to wrap
   * @param stat - The stat name(s) to record timing to. Can be a single string or an array of strings.
   * @returns A builder instance for chaining additional options
   */
  asyncTimer<P extends unknown[], R>(func: (...args: P) => Promise<R>, stat: string | string[]): IAsyncTimerBuilder {
    return new AsyncTimerBuilder(this.client, func as (...args: unknown[]) => Promise<unknown>, stat);
  }

  /**
   * Wrap an async function to automatically time its execution as a distribution metric (DogStatsD only).
   * Returns a builder that supports chaining with withTags(), withSampleRate(), and withCallback().
   * Call create() to get the wrapped function.
   *
   * @param func - The async function to wrap
   * @param stat - The stat name(s) to record timing to. Can be a single string or an array of strings.
   * @returns A builder instance for chaining additional options
   */
  asyncDistTimer<P extends unknown[], R>(
    func: (...args: P) => Promise<R>,
    stat: string | string[],
  ): IAsyncDistTimerBuilder {
    return new AsyncDistTimerBuilder(this.client, func as (...args: unknown[]) => Promise<unknown>, stat);
  }

  /**
   * Wrap a synchronous function to automatically time its execution.
   * Returns a builder that supports chaining with withTags(), withSampleRate(), and withCallback().
   * Call create() to get the wrapped function.
   *
   * @param func - The synchronous function to wrap
   * @param stat - The stat name(s) to record timing to. Can be a single string or an array of strings.
   * @returns A builder instance for chaining additional options
   */
  timer<P extends unknown[], R>(func: (...args: P) => R, stat: string | string[]): ITimerBuilder {
    return new TimerBuilder(this.client, func as (...args: unknown[]) => unknown, stat);
  }
}
