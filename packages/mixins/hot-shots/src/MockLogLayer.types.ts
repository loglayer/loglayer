import type { CheckOptions, DatadogChecksValues, StatsCb, Tags } from "hot-shots";

declare module "loglayer" {
  interface MockLogLayer {
    statsIncrement(stat: string, tags?: Tags): MockLogLayer;
    statsIncrement(
      stat: string | string[],
      value: number,
      sampleRate?: number,
      tags?: Tags,
      callback?: StatsCb,
    ): MockLogLayer;
    statsIncrement(stat: string | string[], value: number, tags?: Tags, callback?: StatsCb): MockLogLayer;
    statsIncrement(stat: string | string[], value: number, callback?: StatsCb): MockLogLayer;
    statsIncrement(stat: string | string[], value: number, sampleRate?: number, callback?: StatsCb): MockLogLayer;

    statsDecrement(stat: string): MockLogLayer;
    statsDecrement(stat: string, tags?: Tags): MockLogLayer;
    statsDecrement(
      stat: string | string[],
      value: number,
      sampleRate?: number,
      tags?: Tags,
      callback?: StatsCb,
    ): MockLogLayer;
    statsDecrement(stat: string | string[], value: number, tags?: Tags, callback?: StatsCb): MockLogLayer;
    statsDecrement(stat: string | string[], value: number, callback?: StatsCb): MockLogLayer;
    statsDecrement(stat: string | string[], value: number, sampleRate?: number, callback?: StatsCb): MockLogLayer;

    statsTiming(
      stat: string | string[],
      value: number | Date,
      sampleRate?: number,
      tags?: Tags,
      callback?: StatsCb,
    ): MockLogLayer;
    statsTiming(stat: string | string[], value: number | Date, tags?: Tags, callback?: StatsCb): MockLogLayer;
    statsTiming(stat: string | string[], value: number | Date, callback?: StatsCb): MockLogLayer;
    statsTiming(stat: string | string[], value: number | Date, sampleRate?: number, callback?: StatsCb): MockLogLayer;

    statsTimer<P extends any[], R>(
      func: (...args: P) => R,
      stat: string | string[],
      sampleRate?: number,
      tags?: Tags,
      callback?: StatsCb,
    ): (...args: P) => R;
    statsTimer<P extends any[], R>(
      func: (...args: P) => R,
      stat: string | string[],
      tags?: Tags,
      callback?: StatsCb,
    ): (...args: P) => R;
    statsTimer<P extends any[], R>(
      func: (...args: P) => R,
      stat: string | string[],
      callback?: StatsCb,
    ): (...args: P) => R;
    statsTimer<P extends any[], R>(
      func: (...args: P) => R,
      stat: string | string[],
      sampleRate?: number,
      callback?: StatsCb,
    ): (...args: P) => R;

    statsAsyncTimer<P extends any[], R>(
      func: (...args: P) => Promise<R>,
      stat: string | string[],
      sampleRate?: number,
      tags?: Tags,
      callback?: StatsCb,
    ): (...args: P) => Promise<R>;
    statsAsyncTimer<P extends any[], R>(
      func: (...args: P) => Promise<R>,
      stat: string | string[],
      tags?: Tags,
      callback?: StatsCb,
    ): (...args: P) => Promise<R>;
    statsAsyncTimer<P extends any[], R>(
      func: (...args: P) => Promise<R>,
      stat: string | string[],
      callback?: StatsCb,
    ): (...args: P) => Promise<R>;
    statsAsyncTimer<P extends any[], R>(
      func: (...args: P) => Promise<R>,
      stat: string | string[],
      sampleRate?: number,
      callback?: StatsCb,
    ): (...args: P) => Promise<R>;

    statsAsyncDistTimer<P extends any[], R>(
      func: (...args: P) => Promise<R>,
      stat: string | string[],
      sampleRate?: number,
      tags?: Tags,
      callback?: StatsCb,
    ): (...args: P) => Promise<R>;
    statsAsyncDistTimer<P extends any[], R>(
      func: (...args: P) => Promise<R>,
      stat: string | string[],
      tags?: Tags,
      callback?: StatsCb,
    ): (...args: P) => Promise<R>;
    statsAsyncDistTimer<P extends any[], R>(
      func: (...args: P) => Promise<R>,
      stat: string | string[],
      callback?: StatsCb,
    ): (...args: P) => Promise<R>;
    statsAsyncDistTimer<P extends any[], R>(
      func: (...args: P) => Promise<R>,
      stat: string | string[],
      sampleRate?: number,
      callback?: StatsCb,
    ): (...args: P) => Promise<R>;

    statsHistogram(
      stat: string | string[],
      value: number,
      sampleRate?: number,
      tags?: Tags,
      callback?: StatsCb,
    ): MockLogLayer;
    statsHistogram(stat: string | string[], value: number, tags?: Tags, callback?: StatsCb): MockLogLayer;
    statsHistogram(stat: string | string[], value: number, callback?: StatsCb): MockLogLayer;
    statsHistogram(stat: string | string[], value: number, sampleRate?: number, callback?: StatsCb): MockLogLayer;

    statsDistribution(
      stat: string | string[],
      value: number,
      sampleRate?: number,
      tags?: Tags,
      callback?: StatsCb,
    ): MockLogLayer;
    statsDistribution(stat: string | string[], value: number, tags?: Tags, callback?: StatsCb): MockLogLayer;
    statsDistribution(stat: string | string[], value: number, callback?: StatsCb): MockLogLayer;
    statsDistribution(stat: string | string[], value: number, sampleRate?: number, callback?: StatsCb): MockLogLayer;

    statsGauge(
      stat: string | string[],
      value: number,
      sampleRate?: number,
      tags?: Tags,
      callback?: StatsCb,
    ): MockLogLayer;
    statsGauge(stat: string | string[], value: number, tags?: Tags, callback?: StatsCb): MockLogLayer;
    statsGauge(stat: string | string[], value: number, callback?: StatsCb): MockLogLayer;
    statsGauge(stat: string | string[], value: number, sampleRate?: number, callback?: StatsCb): MockLogLayer;

    statsGaugeDelta(
      stat: string | string[],
      value: number,
      sampleRate?: number,
      tags?: Tags,
      callback?: StatsCb,
    ): MockLogLayer;
    statsGaugeDelta(stat: string | string[], value: number, tags?: Tags, callback?: StatsCb): MockLogLayer;
    statsGaugeDelta(stat: string | string[], value: number, callback?: StatsCb): MockLogLayer;
    statsGaugeDelta(stat: string | string[], value: number, sampleRate?: number, callback?: StatsCb): MockLogLayer;

    statsSet(
      stat: string | string[],
      value: number | string,
      sampleRate?: number,
      tags?: Tags,
      callback?: StatsCb,
    ): MockLogLayer;
    statsSet(stat: string | string[], value: number | string, tags?: Tags, callback?: StatsCb): MockLogLayer;
    statsSet(stat: string | string[], value: number | string, callback?: StatsCb): MockLogLayer;
    statsSet(stat: string | string[], value: number | string, sampleRate?: number, callback?: StatsCb): MockLogLayer;

    statsUnique(
      stat: string | string[],
      value: number | string,
      sampleRate?: number,
      tags?: Tags,
      callback?: StatsCb,
    ): MockLogLayer;
    statsUnique(stat: string | string[], value: number | string, tags?: Tags, callback?: StatsCb): MockLogLayer;
    statsUnique(stat: string | string[], value: number | string, callback?: StatsCb): MockLogLayer;
    statsUnique(stat: string | string[], value: number | string, sampleRate?: number, callback?: StatsCb): MockLogLayer;

    statsCheck(
      name: string,
      status: DatadogChecksValues,
      options?: CheckOptions,
      tags?: Tags,
      callback?: StatsCb,
    ): MockLogLayer;
  }
}
