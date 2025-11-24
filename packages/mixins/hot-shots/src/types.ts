import type { CheckOptions, DatadogChecksValues, StatsD } from "hot-shots";

/**
 * Callback function type for stats operations
 */
export type StatsCallback = (error?: Error, bytes?: number) => void;

/**
 * Tags can be provided as an array of strings or an object
 */
export type StatsTags = string[] | Record<string, string>;

/**
 * Builder interface for chaining stats method configurations
 */
export interface IStatsBuilder {
  /**
   * Add tags to the metric
   */
  withTags(tags: StatsTags): IStatsBuilder;

  /**
   * Set the sample rate for the metric (0.0 to 1.0)
   */
  withSampleRate(rate: number): IStatsBuilder;

  /**
   * Add a callback function to be called after sending the metric
   */
  withCallback(callback: StatsCallback): IStatsBuilder;

  /**
   * Send the metric with the configured options
   */
  send(): void;
}

/**
 * Builder interface specifically for increment/decrement methods with withValue support
 */
export interface IIncrementDecrementBuilder extends IStatsBuilder {
  /**
   * Set the increment/decrement value
   */
  withValue(value: number): IIncrementDecrementBuilder;
}

/**
 * Builder interface specifically for event method with withText support
 */
export interface IEventBuilder extends IStatsBuilder {
  /**
   * Set the event text
   */
  withText(text: string): IEventBuilder;
}

/**
 * Builder interface specifically for check method with withOptions support
 */
export interface ICheckBuilder extends IStatsBuilder {
  /**
   * Set service check options
   */
  withOptions(options: CheckOptions): ICheckBuilder;
}

/**
 * Builder interface for asyncTimer method that returns a wrapped function
 */
export interface IAsyncTimerBuilder extends IStatsBuilder {
  /**
   * Add tags to the metric
   */
  withTags(tags: StatsTags): IAsyncTimerBuilder;

  /**
   * Set the sample rate for the metric (0.0 to 1.0)
   */
  withSampleRate(rate: number): IAsyncTimerBuilder;

  /**
   * Add a callback function to be called after sending the metric
   */
  withCallback(callback: StatsCallback): IAsyncTimerBuilder;

  /**
   * Create the wrapped async function that will automatically time its execution
   * @returns The wrapped function that records timing when executed
   */
  create<P extends unknown[], R>(): (...args: P) => Promise<R>;
}

/**
 * Builder interface for asyncDistTimer method that returns a wrapped function
 */
export interface IAsyncDistTimerBuilder extends IStatsBuilder {
  /**
   * Add tags to the metric
   */
  withTags(tags: StatsTags): IAsyncDistTimerBuilder;

  /**
   * Set the sample rate for the metric (0.0 to 1.0)
   */
  withSampleRate(rate: number): IAsyncDistTimerBuilder;

  /**
   * Add a callback function to be called after sending the metric
   */
  withCallback(callback: StatsCallback): IAsyncDistTimerBuilder;

  /**
   * Create the wrapped async function that will automatically time its execution as a distribution metric
   * @returns The wrapped function that records timing when executed
   */
  create<P extends unknown[], R>(): (...args: P) => Promise<R>;
}

/**
 * Builder interface for timer method that returns a wrapped function
 */
export interface ITimerBuilder extends IStatsBuilder {
  /**
   * Add tags to the metric
   */
  withTags(tags: StatsTags): ITimerBuilder;

  /**
   * Set the sample rate for the metric (0.0 to 1.0)
   */
  withSampleRate(rate: number): ITimerBuilder;

  /**
   * Add a callback function to be called after sending the metric
   */
  withCallback(callback: StatsCallback): ITimerBuilder;

  /**
   * Create the wrapped synchronous function that will automatically time its execution
   * @returns The wrapped function that records timing when executed
   */
  create<P extends unknown[], R>(): (...args: P) => R;
}

/**
 * Stats API interface containing all hot-shots methods
 */
export interface IStatsAPI {
  /**
   * Increment a counter metric
   */
  increment(stat: string | string[]): IIncrementDecrementBuilder;

  /**
   * Decrement a counter metric
   */
  decrement(stat: string | string[]): IIncrementDecrementBuilder;

  /**
   * Set a gauge metric to a specific value
   */
  gauge(stat: string | string[], value: number): IStatsBuilder;

  /**
   * Change a gauge metric by a delta amount
   */
  gaugeDelta(stat: string | string[], delta: number): IStatsBuilder;

  /**
   * Record a histogram value
   */
  histogram(stat: string | string[], value: number): IStatsBuilder;

  /**
   * Record a distribution value (DataDog v6)
   */
  distribution(stat: string | string[], value: number): IStatsBuilder;

  /**
   * Record a timing value in milliseconds
   */
  timing(stat: string | string[], value: number | Date): IStatsBuilder;

  /**
   * Record a unique/set value
   */
  set(stat: string | string[], value: string | number): IStatsBuilder;

  /**
   * Record a unique/set value (alias of set)
   */
  unique(stat: string | string[], value: string | number): IStatsBuilder;

  /**
   * Send an event (DataDog only)
   */
  event(title: string): IEventBuilder;

  /**
   * Send a service check (DataDog only)
   */
  check(name: string, status: DatadogChecksValues): ICheckBuilder;

  /**
   * Wrap an async function to automatically time its execution.
   * Returns a builder that supports chaining with withTags(), withSampleRate(), and withCallback().
   * Call create() to get the wrapped function.
   *
   * @param func - The async function to wrap
   * @param stat - The stat name(s) to record timing to. Can be a single string or an array of strings.
   * @returns A builder instance for chaining additional options
   */
  asyncTimer<P extends unknown[], R>(func: (...args: P) => Promise<R>, stat: string | string[]): IAsyncTimerBuilder;

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
  ): IAsyncDistTimerBuilder;

  /**
   * Wrap a synchronous function to automatically time its execution.
   * Returns a builder that supports chaining with withTags(), withSampleRate(), and withCallback().
   * Call create() to get the wrapped function.
   *
   * @param func - The synchronous function to wrap
   * @param stat - The stat name(s) to record timing to. Can be a single string or an array of strings.
   * @returns A builder instance for chaining additional options
   */
  timer<P extends unknown[], R>(func: (...args: P) => R, stat: string | string[]): ITimerBuilder;
}

/**
 * Generic mixin interface for hot-shots stats methods
 * T is the instance type (LogLayer or MockLogLayer)
 */
export interface IHotShotsMixin<_T> {
  /**
   * Access to stats API for sending metrics
   */
  stats: IStatsAPI;

  /**
   * Get the underlying hot-shots StatsD client instance
   * @returns The StatsD client instance that was configured when the mixin was registered
   */
  getClient(): StatsD;
}

declare module "@loglayer/shared" {
  interface ILogLayer<This> extends IHotShotsMixin<This> {}
}

declare module "loglayer" {
  interface LogLayer extends IHotShotsMixin<LogLayer> {}
  interface MockLogLayer extends IHotShotsMixin<MockLogLayer> {}
}
