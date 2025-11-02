import type { CheckOptions, DatadogChecksValues, StatsCb, Tags } from "hot-shots";

declare module "loglayer" {
  interface LogLayer {
    /**
     * Increments a counter stat by one.
     * @param stat - The stat name to increment
     * @param tags - Optional tags to attach to the metric (DogStatsD/Telegraf only)
     * @returns The LogLayer instance for chaining
     */
    statsIncrement(stat: string, tags?: Tags): LogLayer;
    /**
     * Increments a counter stat by a specified value.
     * @param stat - The stat name(s) to increment
     * @param value - The value to increment by
     * @param sampleRate - Optional sample rate (0-1). The StatsD daemon will compensate for sampling
     * @param tags - Optional tags to attach to the metric (DogStatsD/Telegraf only)
     * @param callback - Optional callback function that receives (error, bytes)
     * @returns The LogLayer instance for chaining
     */
    statsIncrement(
      stat: string | string[],
      value: number,
      sampleRate?: number,
      tags?: Tags,
      callback?: StatsCb,
    ): LogLayer;
    /**
     * Increments a counter stat by a specified value.
     * @param stat - The stat name(s) to increment
     * @param value - The value to increment by
     * @param tags - Optional tags to attach to the metric (DogStatsD/Telegraf only)
     * @param callback - Optional callback function that receives (error, bytes)
     * @returns The LogLayer instance for chaining
     */
    statsIncrement(stat: string | string[], value: number, tags?: Tags, callback?: StatsCb): LogLayer;
    /**
     * Increments a counter stat by a specified value.
     * @param stat - The stat name(s) to increment
     * @param value - The value to increment by
     * @param callback - Optional callback function that receives (error, bytes)
     * @returns The LogLayer instance for chaining
     */
    statsIncrement(stat: string | string[], value: number, callback?: StatsCb): LogLayer;
    /**
     * Increments a counter stat by a specified value.
     * @param stat - The stat name(s) to increment
     * @param value - The value to increment by
     * @param sampleRate - Optional sample rate (0-1). The StatsD daemon will compensate for sampling
     * @param callback - Optional callback function that receives (error, bytes)
     * @returns The LogLayer instance for chaining
     */
    statsIncrement(stat: string | string[], value: number, sampleRate?: number, callback?: StatsCb): LogLayer;

    /**
     * Decrements a counter stat by one.
     * @param stat - The stat name to decrement
     * @returns The LogLayer instance for chaining
     */
    statsDecrement(stat: string): LogLayer;
    /**
     * Decrements a counter stat by one.
     * @param stat - The stat name to decrement
     * @param tags - Optional tags to attach to the metric (DogStatsD/Telegraf only)
     * @returns The LogLayer instance for chaining
     */
    statsDecrement(stat: string, tags?: Tags): LogLayer;
    /**
     * Decrements a counter stat by a specified value.
     * @param stat - The stat name(s) to decrement
     * @param value - The value to decrement by
     * @param sampleRate - Optional sample rate (0-1). The StatsD daemon will compensate for sampling
     * @param tags - Optional tags to attach to the metric (DogStatsD/Telegraf only)
     * @param callback - Optional callback function that receives (error, bytes)
     * @returns The LogLayer instance for chaining
     */
    statsDecrement(
      stat: string | string[],
      value: number,
      sampleRate?: number,
      tags?: Tags,
      callback?: StatsCb,
    ): LogLayer;
    /**
     * Decrements a counter stat by a specified value.
     * @param stat - The stat name(s) to decrement
     * @param value - The value to decrement by
     * @param tags - Optional tags to attach to the metric (DogStatsD/Telegraf only)
     * @param callback - Optional callback function that receives (error, bytes)
     * @returns The LogLayer instance for chaining
     */
    statsDecrement(stat: string | string[], value: number, tags?: Tags, callback?: StatsCb): LogLayer;
    /**
     * Decrements a counter stat by a specified value.
     * @param stat - The stat name(s) to decrement
     * @param value - The value to decrement by
     * @param callback - Optional callback function that receives (error, bytes)
     * @returns The LogLayer instance for chaining
     */
    statsDecrement(stat: string | string[], value: number, callback?: StatsCb): LogLayer;
    /**
     * Decrements a counter stat by a specified value.
     * @param stat - The stat name(s) to decrement
     * @param value - The value to decrement by
     * @param sampleRate - Optional sample rate (0-1). The StatsD daemon will compensate for sampling
     * @param callback - Optional callback function that receives (error, bytes)
     * @returns The LogLayer instance for chaining
     */
    statsDecrement(stat: string | string[], value: number, sampleRate?: number, callback?: StatsCb): LogLayer;

    /**
     * Sends a timing command with the specified milliseconds or Date object.
     * If a Date object is provided, the difference from now is calculated in milliseconds.
     * @param stat - The stat name(s) to record timing for
     * @param value - The timing value in milliseconds, or a Date object to calculate the difference
     * @param sampleRate - Optional sample rate (0-1). The StatsD daemon will compensate for sampling
     * @param tags - Optional tags to attach to the metric (DogStatsD/Telegraf only)
     * @param callback - Optional callback function that receives (error, bytes)
     * @returns The LogLayer instance for chaining
     */
    statsTiming(
      stat: string | string[],
      value: number | Date,
      sampleRate?: number,
      tags?: Tags,
      callback?: StatsCb,
    ): LogLayer;
    /**
     * Sends a timing command with the specified milliseconds or Date object.
     * @param stat - The stat name(s) to record timing for
     * @param value - The timing value in milliseconds, or a Date object to calculate the difference
     * @param tags - Optional tags to attach to the metric (DogStatsD/Telegraf only)
     * @param callback - Optional callback function that receives (error, bytes)
     * @returns The LogLayer instance for chaining
     */
    statsTiming(stat: string | string[], value: number | Date, tags?: Tags, callback?: StatsCb): LogLayer;
    /**
     * Sends a timing command with the specified milliseconds or Date object.
     * @param stat - The stat name(s) to record timing for
     * @param value - The timing value in milliseconds, or a Date object to calculate the difference
     * @param callback - Optional callback function that receives (error, bytes)
     * @returns The LogLayer instance for chaining
     */
    statsTiming(stat: string | string[], value: number | Date, callback?: StatsCb): LogLayer;
    /**
     * Sends a timing command with the specified milliseconds or Date object.
     * @param stat - The stat name(s) to record timing for
     * @param value - The timing value in milliseconds, or a Date object to calculate the difference
     * @param sampleRate - Optional sample rate (0-1). The StatsD daemon will compensate for sampling
     * @param callback - Optional callback function that receives (error, bytes)
     * @returns The LogLayer instance for chaining
     */
    statsTiming(stat: string | string[], value: number | Date, sampleRate?: number, callback?: StatsCb): LogLayer;

    /**
     * Returns a function that records how long the first parameter (function) takes to execute
     * and then sends that value using timing. The returned function accepts the same parameters
     * as the original function.
     * @param func - The function to instrument
     * @param stat - The stat name(s) to record timing for
     * @param sampleRate - Optional sample rate (0-1). The StatsD daemon will compensate for sampling
     * @param tags - Optional tags to attach to the metric (DogStatsD/Telegraf only)
     * @param callback - Optional callback function that receives (error, bytes)
     * @returns A function with the same signature as the input function that records timing
     */
    statsTimer<P extends any[], R>(
      func: (...args: P) => R,
      stat: string | string[],
      sampleRate?: number,
      tags?: Tags,
      callback?: StatsCb,
    ): (...args: P) => R;
    /**
     * Returns a function that records how long the first parameter (function) takes to execute
     * and then sends that value using timing.
     * @param func - The function to instrument
     * @param stat - The stat name(s) to record timing for
     * @param tags - Optional tags to attach to the metric (DogStatsD/Telegraf only)
     * @param callback - Optional callback function that receives (error, bytes)
     * @returns A function with the same signature as the input function that records timing
     */
    statsTimer<P extends any[], R>(
      func: (...args: P) => R,
      stat: string | string[],
      tags?: Tags,
      callback?: StatsCb,
    ): (...args: P) => R;
    /**
     * Returns a function that records how long the first parameter (function) takes to execute
     * and then sends that value using timing.
     * @param func - The function to instrument
     * @param stat - The stat name(s) to record timing for
     * @param callback - Optional callback function that receives (error, bytes)
     * @returns A function with the same signature as the input function that records timing
     */
    statsTimer<P extends any[], R>(
      func: (...args: P) => R,
      stat: string | string[],
      callback?: StatsCb,
    ): (...args: P) => R;
    /**
     * Returns a function that records how long the first parameter (function) takes to execute
     * and then sends that value using timing.
     * @param func - The function to instrument
     * @param stat - The stat name(s) to record timing for
     * @param sampleRate - Optional sample rate (0-1). The StatsD daemon will compensate for sampling
     * @param callback - Optional callback function that receives (error, bytes)
     * @returns A function with the same signature as the input function that records timing
     */
    statsTimer<P extends any[], R>(
      func: (...args: P) => R,
      stat: string | string[],
      sampleRate?: number,
      callback?: StatsCb,
    ): (...args: P) => R;

    /**
     * Similar to statsTimer, but for functions that return a Promise. Returns a Promise that
     * records the timing of the function execution.
     * @param func - The async function to instrument
     * @param stat - The stat name(s) to record timing for
     * @param sampleRate - Optional sample rate (0-1). The StatsD daemon will compensate for sampling
     * @param tags - Optional tags to attach to the metric (DogStatsD/Telegraf only)
     * @param callback - Optional callback function that receives (error, bytes)
     * @returns A function that returns a Promise with the same signature as the input function
     */
    statsAsyncTimer<P extends any[], R>(
      func: (...args: P) => Promise<R>,
      stat: string | string[],
      sampleRate?: number,
      tags?: Tags,
      callback?: StatsCb,
    ): (...args: P) => Promise<R>;
    /**
     * Similar to statsTimer, but for functions that return a Promise.
     * @param func - The async function to instrument
     * @param stat - The stat name(s) to record timing for
     * @param tags - Optional tags to attach to the metric (DogStatsD/Telegraf only)
     * @param callback - Optional callback function that receives (error, bytes)
     * @returns A function that returns a Promise with the same signature as the input function
     */
    statsAsyncTimer<P extends any[], R>(
      func: (...args: P) => Promise<R>,
      stat: string | string[],
      tags?: Tags,
      callback?: StatsCb,
    ): (...args: P) => Promise<R>;
    /**
     * Similar to statsTimer, but for functions that return a Promise.
     * @param func - The async function to instrument
     * @param stat - The stat name(s) to record timing for
     * @param callback - Optional callback function that receives (error, bytes)
     * @returns A function that returns a Promise with the same signature as the input function
     */
    statsAsyncTimer<P extends any[], R>(
      func: (...args: P) => Promise<R>,
      stat: string | string[],
      callback?: StatsCb,
    ): (...args: P) => Promise<R>;
    /**
     * Similar to statsTimer, but for functions that return a Promise.
     * @param func - The async function to instrument
     * @param stat - The stat name(s) to record timing for
     * @param sampleRate - Optional sample rate (0-1). The StatsD daemon will compensate for sampling
     * @param callback - Optional callback function that receives (error, bytes)
     * @returns A function that returns a Promise with the same signature as the input function
     */
    statsAsyncTimer<P extends any[], R>(
      func: (...args: P) => Promise<R>,
      stat: string | string[],
      sampleRate?: number,
      callback?: StatsCb,
    ): (...args: P) => Promise<R>;

    /**
     * Similar to statsAsyncTimer, but records the timing as a distribution metric instead of a timing.
     * Distribution metrics track the statistical distribution of values (DogStatsD).
     * @param func - The async function to instrument
     * @param stat - The stat name(s) to record timing for
     * @param sampleRate - Optional sample rate (0-1). The StatsD daemon will compensate for sampling
     * @param tags - Optional tags to attach to the metric (DogStatsD/Telegraf only)
     * @param callback - Optional callback function that receives (error, bytes)
     * @returns A function that returns a Promise with the same signature as the input function
     */
    statsAsyncDistTimer<P extends any[], R>(
      func: (...args: P) => Promise<R>,
      stat: string | string[],
      sampleRate?: number,
      tags?: Tags,
      callback?: StatsCb,
    ): (...args: P) => Promise<R>;
    /**
     * Similar to statsAsyncTimer, but records the timing as a distribution metric.
     * @param func - The async function to instrument
     * @param stat - The stat name(s) to record timing for
     * @param tags - Optional tags to attach to the metric (DogStatsD/Telegraf only)
     * @param callback - Optional callback function that receives (error, bytes)
     * @returns A function that returns a Promise with the same signature as the input function
     */
    statsAsyncDistTimer<P extends any[], R>(
      func: (...args: P) => Promise<R>,
      stat: string | string[],
      tags?: Tags,
      callback?: StatsCb,
    ): (...args: P) => Promise<R>;
    /**
     * Similar to statsAsyncTimer, but records the timing as a distribution metric.
     * @param func - The async function to instrument
     * @param stat - The stat name(s) to record timing for
     * @param callback - Optional callback function that receives (error, bytes)
     * @returns A function that returns a Promise with the same signature as the input function
     */
    statsAsyncDistTimer<P extends any[], R>(
      func: (...args: P) => Promise<R>,
      stat: string | string[],
      callback?: StatsCb,
    ): (...args: P) => Promise<R>;
    /**
     * Similar to statsAsyncTimer, but records the timing as a distribution metric.
     * @param func - The async function to instrument
     * @param stat - The stat name(s) to record timing for
     * @param sampleRate - Optional sample rate (0-1). The StatsD daemon will compensate for sampling
     * @param callback - Optional callback function that receives (error, bytes)
     * @returns A function that returns a Promise with the same signature as the input function
     */
    statsAsyncDistTimer<P extends any[], R>(
      func: (...args: P) => Promise<R>,
      stat: string | string[],
      sampleRate?: number,
      callback?: StatsCb,
    ): (...args: P) => Promise<R>;

    /**
     * Records a value in a histogram. Histograms track the statistical distribution of values
     * across your infrastructure (DogStatsD/Telegraf only).
     * @param stat - The stat name(s) to record
     * @param value - The value to record
     * @param sampleRate - Optional sample rate (0-1). The StatsD daemon will compensate for sampling
     * @param tags - Optional tags to attach to the metric (DogStatsD/Telegraf only)
     * @param callback - Optional callback function that receives (error, bytes)
     * @returns The LogLayer instance for chaining
     */
    statsHistogram(
      stat: string | string[],
      value: number,
      sampleRate?: number,
      tags?: Tags,
      callback?: StatsCb,
    ): LogLayer;
    /**
     * Records a value in a histogram.
     * @param stat - The stat name(s) to record
     * @param value - The value to record
     * @param tags - Optional tags to attach to the metric (DogStatsD/Telegraf only)
     * @param callback - Optional callback function that receives (error, bytes)
     * @returns The LogLayer instance for chaining
     */
    statsHistogram(stat: string | string[], value: number, tags?: Tags, callback?: StatsCb): LogLayer;
    /**
     * Records a value in a histogram.
     * @param stat - The stat name(s) to record
     * @param value - The value to record
     * @param callback - Optional callback function that receives (error, bytes)
     * @returns The LogLayer instance for chaining
     */
    statsHistogram(stat: string | string[], value: number, callback?: StatsCb): LogLayer;
    /**
     * Records a value in a histogram.
     * @param stat - The stat name(s) to record
     * @param value - The value to record
     * @param sampleRate - Optional sample rate (0-1). The StatsD daemon will compensate for sampling
     * @param callback - Optional callback function that receives (error, bytes)
     * @returns The LogLayer instance for chaining
     */
    statsHistogram(stat: string | string[], value: number, sampleRate?: number, callback?: StatsCb): LogLayer;

    /**
     * Tracks the statistical distribution of a set of values across your infrastructure (DogStatsD v6).
     * Similar to histogram but optimized for distributions.
     * @param stat - The stat name(s) to record
     * @param value - The value to record
     * @param sampleRate - Optional sample rate (0-1). The StatsD daemon will compensate for sampling
     * @param tags - Optional tags to attach to the metric (DogStatsD/Telegraf only)
     * @param callback - Optional callback function that receives (error, bytes)
     * @returns The LogLayer instance for chaining
     */
    statsDistribution(
      stat: string | string[],
      value: number,
      sampleRate?: number,
      tags?: Tags,
      callback?: StatsCb,
    ): LogLayer;
    /**
     * Tracks the statistical distribution of a set of values.
     * @param stat - The stat name(s) to record
     * @param value - The value to record
     * @param tags - Optional tags to attach to the metric (DogStatsD/Telegraf only)
     * @param callback - Optional callback function that receives (error, bytes)
     * @returns The LogLayer instance for chaining
     */
    statsDistribution(stat: string | string[], value: number, tags?: Tags, callback?: StatsCb): LogLayer;
    /**
     * Tracks the statistical distribution of a set of values.
     * @param stat - The stat name(s) to record
     * @param value - The value to record
     * @param callback - Optional callback function that receives (error, bytes)
     * @returns The LogLayer instance for chaining
     */
    statsDistribution(stat: string | string[], value: number, callback?: StatsCb): LogLayer;
    /**
     * Tracks the statistical distribution of a set of values.
     * @param stat - The stat name(s) to record
     * @param value - The value to record
     * @param sampleRate - Optional sample rate (0-1). The StatsD daemon will compensate for sampling
     * @param callback - Optional callback function that receives (error, bytes)
     * @returns The LogLayer instance for chaining
     */
    statsDistribution(stat: string | string[], value: number, sampleRate?: number, callback?: StatsCb): LogLayer;

    /**
     * Sets or changes a gauge stat to the specified value.
     * @param stat - The stat name(s) to set
     * @param value - The value to set the gauge to
     * @param sampleRate - Optional sample rate (0-1). The StatsD daemon will compensate for sampling
     * @param tags - Optional tags to attach to the metric (DogStatsD/Telegraf only)
     * @param callback - Optional callback function that receives (error, bytes)
     * @returns The LogLayer instance for chaining
     */
    statsGauge(stat: string | string[], value: number, sampleRate?: number, tags?: Tags, callback?: StatsCb): LogLayer;
    /**
     * Sets or changes a gauge stat to the specified value.
     * @param stat - The stat name(s) to set
     * @param value - The value to set the gauge to
     * @param tags - Optional tags to attach to the metric (DogStatsD/Telegraf only)
     * @param callback - Optional callback function that receives (error, bytes)
     * @returns The LogLayer instance for chaining
     */
    statsGauge(stat: string | string[], value: number, tags?: Tags, callback?: StatsCb): LogLayer;
    /**
     * Sets or changes a gauge stat to the specified value.
     * @param stat - The stat name(s) to set
     * @param value - The value to set the gauge to
     * @param callback - Optional callback function that receives (error, bytes)
     * @returns The LogLayer instance for chaining
     */
    statsGauge(stat: string | string[], value: number, callback?: StatsCb): LogLayer;
    /**
     * Sets or changes a gauge stat to the specified value.
     * @param stat - The stat name(s) to set
     * @param value - The value to set the gauge to
     * @param sampleRate - Optional sample rate (0-1). The StatsD daemon will compensate for sampling
     * @param callback - Optional callback function that receives (error, bytes)
     * @returns The LogLayer instance for chaining
     */
    statsGauge(stat: string | string[], value: number, sampleRate?: number, callback?: StatsCb): LogLayer;

    /**
     * Changes a gauge stat by a specified amount rather than setting it to a value.
     * Use this to increment or decrement a gauge by a delta.
     * @param stat - The stat name(s) to change
     * @param value - The delta value to change the gauge by (can be positive or negative)
     * @param sampleRate - Optional sample rate (0-1). The StatsD daemon will compensate for sampling
     * @param tags - Optional tags to attach to the metric (DogStatsD/Telegraf only)
     * @param callback - Optional callback function that receives (error, bytes)
     * @returns The LogLayer instance for chaining
     */
    statsGaugeDelta(
      stat: string | string[],
      value: number,
      sampleRate?: number,
      tags?: Tags,
      callback?: StatsCb,
    ): LogLayer;
    /**
     * Changes a gauge stat by a specified amount rather than setting it.
     * @param stat - The stat name(s) to change
     * @param value - The delta value to change the gauge by
     * @param tags - Optional tags to attach to the metric (DogStatsD/Telegraf only)
     * @param callback - Optional callback function that receives (error, bytes)
     * @returns The LogLayer instance for chaining
     */
    statsGaugeDelta(stat: string | string[], value: number, tags?: Tags, callback?: StatsCb): LogLayer;
    /**
     * Changes a gauge stat by a specified amount rather than setting it.
     * @param stat - The stat name(s) to change
     * @param value - The delta value to change the gauge by
     * @param callback - Optional callback function that receives (error, bytes)
     * @returns The LogLayer instance for chaining
     */
    statsGaugeDelta(stat: string | string[], value: number, callback?: StatsCb): LogLayer;
    /**
     * Changes a gauge stat by a specified amount rather than setting it.
     * @param stat - The stat name(s) to change
     * @param value - The delta value to change the gauge by
     * @param sampleRate - Optional sample rate (0-1). The StatsD daemon will compensate for sampling
     * @param callback - Optional callback function that receives (error, bytes)
     * @returns The LogLayer instance for chaining
     */
    statsGaugeDelta(stat: string | string[], value: number, sampleRate?: number, callback?: StatsCb): LogLayer;

    /**
     * Counts unique occurrences of a stat. Records how many unique elements were tracked.
     * @param stat - The stat name(s) to record
     * @param value - The value to track uniqueness for (number or string)
     * @param sampleRate - Optional sample rate (0-1). The StatsD daemon will compensate for sampling
     * @param tags - Optional tags to attach to the metric (DogStatsD/Telegraf only)
     * @param callback - Optional callback function that receives (error, bytes)
     * @returns The LogLayer instance for chaining
     */
    statsSet(
      stat: string | string[],
      value: number | string,
      sampleRate?: number,
      tags?: Tags,
      callback?: StatsCb,
    ): LogLayer;
    /**
     * Counts unique occurrences of a stat.
     * @param stat - The stat name(s) to record
     * @param value - The value to track uniqueness for (number or string)
     * @param tags - Optional tags to attach to the metric (DogStatsD/Telegraf only)
     * @param callback - Optional callback function that receives (error, bytes)
     * @returns The LogLayer instance for chaining
     */
    statsSet(stat: string | string[], value: number | string, tags?: Tags, callback?: StatsCb): LogLayer;
    /**
     * Counts unique occurrences of a stat.
     * @param stat - The stat name(s) to record
     * @param value - The value to track uniqueness for (number or string)
     * @param callback - Optional callback function that receives (error, bytes)
     * @returns The LogLayer instance for chaining
     */
    statsSet(stat: string | string[], value: number | string, callback?: StatsCb): LogLayer;
    /**
     * Counts unique occurrences of a stat.
     * @param stat - The stat name(s) to record
     * @param value - The value to track uniqueness for (number or string)
     * @param sampleRate - Optional sample rate (0-1). The StatsD daemon will compensate for sampling
     * @param callback - Optional callback function that receives (error, bytes)
     * @returns The LogLayer instance for chaining
     */
    statsSet(stat: string | string[], value: number | string, sampleRate?: number, callback?: StatsCb): LogLayer;

    /**
     * Counts unique occurrences of a stat (alias for statsSet).
     * Records how many unique elements were tracked.
     * @param stat - The stat name(s) to record
     * @param value - The value to track uniqueness for (number or string)
     * @param sampleRate - Optional sample rate (0-1). The StatsD daemon will compensate for sampling
     * @param tags - Optional tags to attach to the metric (DogStatsD/Telegraf only)
     * @param callback - Optional callback function that receives (error, bytes)
     * @returns The LogLayer instance for chaining
     */
    statsUnique(
      stat: string | string[],
      value: number | string,
      sampleRate?: number,
      tags?: Tags,
      callback?: StatsCb,
    ): LogLayer;
    /**
     * Counts unique occurrences of a stat (alias for statsSet).
     * @param stat - The stat name(s) to record
     * @param value - The value to track uniqueness for (number or string)
     * @param tags - Optional tags to attach to the metric (DogStatsD/Telegraf only)
     * @param callback - Optional callback function that receives (error, bytes)
     * @returns The LogLayer instance for chaining
     */
    statsUnique(stat: string | string[], value: number | string, tags?: Tags, callback?: StatsCb): LogLayer;
    /**
     * Counts unique occurrences of a stat (alias for statsSet).
     * @param stat - The stat name(s) to record
     * @param value - The value to track uniqueness for (number or string)
     * @param callback - Optional callback function that receives (error, bytes)
     * @returns The LogLayer instance for chaining
     */
    statsUnique(stat: string | string[], value: number | string, callback?: StatsCb): LogLayer;
    /**
     * Counts unique occurrences of a stat (alias for statsSet).
     * @param stat - The stat name(s) to record
     * @param value - The value to track uniqueness for (number or string)
     * @param sampleRate - Optional sample rate (0-1). The StatsD daemon will compensate for sampling
     * @param callback - Optional callback function that receives (error, bytes)
     * @returns The LogLayer instance for chaining
     */
    statsUnique(stat: string | string[], value: number | string, sampleRate?: number, callback?: StatsCb): LogLayer;

    /**
     * Sends a service check status (DogStatsD only).
     * Service checks monitor the status of an external service that your application depends on.
     * @param name - The name of the service check
     * @param status - The status of the check (OK, WARNING, CRITICAL, UNKNOWN)
     * @param options - Optional check options (hostname, timestamp, message)
     * @param tags - Optional tags to attach to the check
     * @param callback - Optional callback function that receives (error, bytes)
     * @returns The LogLayer instance for chaining
     */
    statsCheck(
      name: string,
      status: DatadogChecksValues,
      options?: CheckOptions,
      tags?: Tags,
      callback?: StatsCb,
    ): LogLayer;
  }
}
