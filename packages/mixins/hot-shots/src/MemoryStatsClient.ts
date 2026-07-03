import type { StatsRecord } from "./types.js";

type AnyFn = (...args: any[]) => any;

/** Normalize a stat name (array stats are joined with a comma). */
function statName(stat: string | string[]): string {
  return Array.isArray(stat) ? stat.join(",") : stat;
}

/**
 * Parse the trailing builder args (sampleRate?, tags?, callback?) in the fixed
 * order the hot-shots builders emit them.
 */
function parseOpts(args: unknown[]): {
  sampleRate?: number;
  tags?: string[];
  callback?: AnyFn;
} {
  let i = 0;
  const sampleRate = typeof args[i] === "number" ? (args[i++] as number) : undefined;
  const tags = Array.isArray(args[i]) ? (args[i++] as string[]) : undefined;
  const callback = typeof args[i] === "function" ? (args[i++] as AnyFn) : undefined;
  return { sampleRate, tags, callback };
}

/**
 * An in-memory StatsD-compatible client that records structured metric records
 * instead of sending them over the network. Pass it to `hotshotsMixin()` in
 * tests and assert against `records`.
 *
 * @example
 * ```ts
 * const stats = new MemoryStatsClient();
 * useLogLayerMixin(hotshotsMixin(stats));
 * // ...exercise code...
 * expect(stats.records).toContainEqual({ type: "increment", name: "x", value: 1, tags: undefined, sampleRate: undefined });
 * ```
 */
export class MemoryStatsClient {
  /** Structured records of every metric sent through this client. */
  readonly records: StatsRecord[] = [];

  /** Clear all recorded metrics. */
  clear(): void {
    this.records.length = 0;
  }

  private record(record: StatsRecord, callback?: AnyFn): void {
    this.records.push(record);
    callback?.(undefined);
  }

  increment(stat: string | string[], ...args: unknown[]): void {
    const value = typeof args[0] === "number" ? (args.shift() as number) : 1;
    const { sampleRate, tags, callback } = parseOpts(args);
    this.record({ type: "increment", name: statName(stat), value, tags, sampleRate }, callback);
  }

  decrement(stat: string | string[], ...args: unknown[]): void {
    const value = typeof args[0] === "number" ? (args.shift() as number) : -1;
    const { sampleRate, tags, callback } = parseOpts(args);
    this.record({ type: "decrement", name: statName(stat), value, tags, sampleRate }, callback);
  }

  gauge(stat: string | string[], value: number, ...args: unknown[]): void {
    const { sampleRate, tags, callback } = parseOpts(args);
    this.record({ type: "gauge", name: statName(stat), value, tags, sampleRate }, callback);
  }

  gaugeDelta(stat: string | string[], value: number, ...args: unknown[]): void {
    const { sampleRate, tags, callback } = parseOpts(args);
    this.record({ type: "gaugeDelta", name: statName(stat), value, tags, sampleRate }, callback);
  }

  histogram(stat: string | string[], value: number, ...args: unknown[]): void {
    const { sampleRate, tags, callback } = parseOpts(args);
    this.record({ type: "histogram", name: statName(stat), value, tags, sampleRate }, callback);
  }

  distribution(stat: string | string[], value: number, ...args: unknown[]): void {
    const { sampleRate, tags, callback } = parseOpts(args);
    this.record({ type: "distribution", name: statName(stat), value, tags, sampleRate }, callback);
  }

  timing(stat: string | string[], value: number | Date, ...args: unknown[]): void {
    const { sampleRate, tags, callback } = parseOpts(args);
    this.record({ type: "timing", name: statName(stat), value, tags, sampleRate }, callback);
  }

  set(stat: string | string[], value: string | number, ...args: unknown[]): void {
    const { sampleRate, tags, callback } = parseOpts(args);
    this.record({ type: "set", name: statName(stat), value, tags, sampleRate }, callback);
  }

  unique(stat: string | string[], value: string | number, ...args: unknown[]): void {
    const { sampleRate, tags, callback } = parseOpts(args);
    this.record({ type: "unique", name: statName(stat), value, tags, sampleRate }, callback);
  }

  event(title: string, text?: string, ...args: unknown[]): void {
    // Builder passes an explicit `undefined` options slot before tags/callback.
    if (args.length && args[0] === undefined) {
      args.shift();
    }
    const tags = Array.isArray(args[0]) ? (args.shift() as string[]) : undefined;
    const callback = typeof args[0] === "function" ? (args.shift() as AnyFn) : undefined;
    this.record({ type: "event", name: title, text, tags }, callback);
  }

  check(name: string, status: number, ...args: unknown[]): void {
    // Builder emits: check(name, status, options?, tags?, callback?) — options is a
    // non-array object and only present when withOptions() was used.
    if (args[0] !== null && typeof args[0] === "object" && !Array.isArray(args[0])) {
      args.shift();
    }
    const tags = Array.isArray(args[0]) ? (args.shift() as string[]) : undefined;
    const callback = typeof args[0] === "function" ? (args.shift() as AnyFn) : undefined;
    this.record({ type: "check", name, status, tags }, callback);
  }

  // Timer builders use a positional convention (func, stat, sampleRate?, tags?,
  // callback?) — sampleRate is always at position 0 of the rest args (even when
  // undefined), unlike the compact direct-metric args — so parse positionally.
  timer(func: AnyFn, stat: string | string[], sampleRate?: number, tags?: string[]): AnyFn {
    return (...callArgs: unknown[]) => {
      const start = Date.now();
      try {
        return func(...callArgs);
      } finally {
        this.records.push({ type: "timer", name: statName(stat), value: Date.now() - start, tags, sampleRate });
      }
    };
  }

  asyncTimer(func: AnyFn, stat: string | string[], sampleRate?: number, tags?: string[]): AnyFn {
    return async (...callArgs: unknown[]) => {
      const start = Date.now();
      try {
        return await func(...callArgs);
      } finally {
        this.records.push({ type: "asyncTimer", name: statName(stat), value: Date.now() - start, tags, sampleRate });
      }
    };
  }

  asyncDistTimer(func: AnyFn, stat: string | string[], sampleRate?: number, tags?: string[]): AnyFn {
    return async (...callArgs: unknown[]) => {
      const start = Date.now();
      try {
        return await func(...callArgs);
      } finally {
        this.records.push({
          type: "asyncDistTimer",
          name: statName(stat),
          value: Date.now() - start,
          tags,
          sampleRate,
        });
      }
    };
  }
}
