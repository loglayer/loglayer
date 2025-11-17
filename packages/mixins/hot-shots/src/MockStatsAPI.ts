import type { DatadogChecksValues } from "hot-shots";
import type {
  IAsyncDistTimerBuilder,
  IAsyncTimerBuilder,
  ICheckBuilder,
  IEventBuilder,
  IIncrementDecrementBuilder,
  IStatsAPI,
  IStatsBuilder,
  ITimerBuilder,
  StatsCallback,
  StatsTags,
} from "./types.js";

/**
 * Base class for mock stats builders.
 * Provides no-op implementations of common builder methods.
 */
abstract class MockCommonStatsBuilder implements IStatsBuilder {
  withTags(_tags: StatsTags): this {
    return this;
  }

  withSampleRate(_rate: number): this {
    return this;
  }

  withCallback(_callback: StatsCallback): this {
    return this;
  }

  send(): void {
    // No-op
  }
}

/**
 * Mock implementation of IncrementBuilder.
 * Does nothing when methods are called.
 */
export class MockIncrementBuilder extends MockCommonStatsBuilder implements IIncrementDecrementBuilder {
  constructor(_stat: string | string[]) {
    super();
  }

  withValue(_value: number): this {
    return this;
  }
}

/**
 * Mock implementation of DecrementBuilder.
 * Does nothing when methods are called.
 */
export class MockDecrementBuilder extends MockCommonStatsBuilder implements IIncrementDecrementBuilder {
  constructor(_stat: string | string[]) {
    super();
  }

  withValue(_value: number): this {
    return this;
  }
}

/**
 * Mock implementation of GaugeBuilder.
 * Does nothing when methods are called.
 */
export class MockGaugeBuilder extends MockCommonStatsBuilder {
  constructor(_stat: string | string[], _value: number) {
    super();
  }
}

/**
 * Mock implementation of GaugeDeltaBuilder.
 * Does nothing when methods are called.
 */
export class MockGaugeDeltaBuilder extends MockCommonStatsBuilder {
  constructor(_stat: string | string[], _delta: number) {
    super();
  }
}

/**
 * Mock implementation of HistogramBuilder.
 * Does nothing when methods are called.
 */
export class MockHistogramBuilder extends MockCommonStatsBuilder {
  constructor(_stat: string | string[], _value: number) {
    super();
  }
}

/**
 * Mock implementation of DistributionBuilder.
 * Does nothing when methods are called.
 */
export class MockDistributionBuilder extends MockCommonStatsBuilder {
  constructor(_stat: string | string[], _value: number) {
    super();
  }
}

/**
 * Mock implementation of TimingBuilder.
 * Does nothing when methods are called.
 */
export class MockTimingBuilder extends MockCommonStatsBuilder {
  constructor(_stat: string | string[], _value: number | Date) {
    super();
  }
}

/**
 * Mock implementation of SetBuilder.
 * Does nothing when methods are called.
 */
export class MockSetBuilder extends MockCommonStatsBuilder {
  constructor(_stat: string | string[], _value: string | number) {
    super();
  }
}

/**
 * Mock implementation of UniqueBuilder.
 * Does nothing when methods are called.
 */
export class MockUniqueBuilder extends MockCommonStatsBuilder {
  constructor(_stat: string | string[], _value: string | number) {
    super();
  }
}

/**
 * Mock implementation of EventBuilder.
 * Does nothing when methods are called.
 */
export class MockEventBuilder extends MockCommonStatsBuilder implements IEventBuilder {
  constructor(_title: string) {
    super();
  }

  withText(_text: string): this {
    return this;
  }
}

/**
 * Mock implementation of CheckBuilder.
 * Does nothing when methods are called.
 */
export class MockCheckBuilder extends MockCommonStatsBuilder implements ICheckBuilder {
  constructor(_name: string, _status: DatadogChecksValues) {
    super();
  }

  withOptions(_options: unknown): this {
    return this;
  }
}

/**
 * Mock implementation of TimerBuilder.
 * Returns a function that simply calls the original function without timing.
 */
export class MockTimerBuilder extends MockCommonStatsBuilder implements ITimerBuilder {
  constructor(
    private readonly func: (...args: unknown[]) => unknown,
    _stat: string | string[],
  ) {
    super();
  }

  create<P extends unknown[], R>(): (...args: P) => R {
    return this.func as (...args: P) => R;
  }
}

/**
 * Mock implementation of AsyncTimerBuilder.
 * Returns a function that simply calls the original async function without timing.
 */
export class MockAsyncTimerBuilder extends MockCommonStatsBuilder implements IAsyncTimerBuilder {
  constructor(
    private readonly func: (...args: unknown[]) => Promise<unknown>,
    _stat: string | string[],
  ) {
    super();
  }

  create<P extends unknown[], R>(): (...args: P) => Promise<R> {
    return this.func as (...args: P) => Promise<R>;
  }
}

/**
 * Mock implementation of AsyncDistTimerBuilder.
 * Returns a function that simply calls the original async function without timing.
 */
export class MockAsyncDistTimerBuilder extends MockCommonStatsBuilder implements IAsyncDistTimerBuilder {
  constructor(
    private readonly func: (...args: unknown[]) => Promise<unknown>,
    _stat: string | string[],
  ) {
    super();
  }

  create<P extends unknown[], R>(): (...args: P) => Promise<R> {
    return this.func as (...args: P) => Promise<R>;
  }
}

/**
 * No-op implementation of IStatsAPI.
 * All methods return mock builder instances that mirror the real builder structure
 * but do nothing when send() is called.
 * This is used when hotshotsMixin(null) is called, allowing the stats API
 * to be used without actually sending any metrics.
 */
export class MockStatsAPI implements IStatsAPI {
  increment(stat: string | string[]): IIncrementDecrementBuilder {
    return new MockIncrementBuilder(stat);
  }

  decrement(stat: string | string[]): IIncrementDecrementBuilder {
    return new MockDecrementBuilder(stat);
  }

  gauge(stat: string | string[], value: number): IStatsBuilder {
    return new MockGaugeBuilder(stat, value);
  }

  gaugeDelta(stat: string | string[], delta: number): IStatsBuilder {
    return new MockGaugeDeltaBuilder(stat, delta);
  }

  histogram(stat: string | string[], value: number): IStatsBuilder {
    return new MockHistogramBuilder(stat, value);
  }

  distribution(stat: string | string[], value: number): IStatsBuilder {
    return new MockDistributionBuilder(stat, value);
  }

  timing(stat: string | string[], value: number | Date): IStatsBuilder {
    return new MockTimingBuilder(stat, value);
  }

  set(stat: string | string[], value: string | number): IStatsBuilder {
    return new MockSetBuilder(stat, value);
  }

  unique(stat: string | string[], value: string | number): IStatsBuilder {
    return new MockUniqueBuilder(stat, value);
  }

  event(title: string): IEventBuilder {
    return new MockEventBuilder(title);
  }

  check(name: string, status: DatadogChecksValues): ICheckBuilder {
    return new MockCheckBuilder(name, status);
  }

  timer<P extends unknown[], R>(func: (...args: P) => R, stat: string | string[]): ITimerBuilder {
    return new MockTimerBuilder(func as (...args: unknown[]) => unknown, stat);
  }

  asyncTimer<P extends unknown[], R>(func: (...args: P) => Promise<R>, stat: string | string[]): IAsyncTimerBuilder {
    return new MockAsyncTimerBuilder(func as (...args: unknown[]) => Promise<unknown>, stat);
  }

  asyncDistTimer<P extends unknown[], R>(
    func: (...args: P) => Promise<R>,
    stat: string | string[],
  ): IAsyncDistTimerBuilder {
    return new MockAsyncDistTimerBuilder(func as (...args: unknown[]) => Promise<unknown>, stat);
  }
}

/**
 * Creates a no-op StatsD client where all methods are empty functions.
 * This is used by getStatsClient() when no client is configured,
 * allowing the mixin to work even without a client configured.
 *
 * @returns A no-op StatsD client
 */
export function createNoOpStatsClient() {
  return {
    increment: () => {},
    decrement: () => {},
    gauge: () => {},
    gaugeDelta: () => {},
    histogram: () => {},
    distribution: () => {},
    timing: () => {},
    set: () => {},
    unique: () => {},
    event: () => {},
    check: () => {},
    timer: (_func: unknown, _stat: unknown) => {},
    asyncTimer: (_func: unknown, _stat: unknown) => {},
    asyncDistTimer: (_func: unknown, _stat: unknown) => {},
  } as any;
}
