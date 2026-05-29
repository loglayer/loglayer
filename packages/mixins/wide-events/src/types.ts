import type { AsyncLocalStorage } from "node:async_hooks";
import type { LogLevelType } from "loglayer";

/**
 * Parameters passed to a custom `shouldEmit` sampling callback.
 * Provides the accumulated wide event data and the log level so the
 * callback can make an informed keep/drop decision.
 */
export interface WideEventSamplingParams {
  /**
   * The accumulated wide event data (wide events + optional context).
   * Contains the merged data that would be emitted if kept.
   */
  wideData: Record<string, any>;

  /**
   * The log level that would be used for the emission.
   */
  level: LogLevelType;
}

/**
 * Sampling strategy for wide events.
 *
 * - `"default"` — a single `rate` applies to all non-error levels.
 * - `"per_level"` — per-level rates keyed by LogLevelType; levels not in the
 *   map are kept unconditionally.
 */
export type WideEventSamplingStrategy = "default" | "per_level";

/**
 * Configuration for sampling wide event emissions.
 *
 * "error" and "fatal" levels default to a 100% keep rate, but can be
 * overridden by setting `perLevel` rates or via `shouldEmit`.
 */
export interface WideEventSamplingConfig {
  /**
   * The sampling strategy.
   *
   * - `"default"` — a single `rate` applies to all non-error levels.
   * - `"per_level"` — per-level rates from the `perLevel` map; levels not in
   *   the map are kept at 100%.
   *
   * @default "default"
   */
  strategy?: WideEventSamplingStrategy;

  /**
   * A rate between 0 and 1 that determines the fraction of events to keep.
   *
   * - `1` (or `true`) — keep 100% (sampling disabled)
   * - `0.1` — ~10% of events kept
   * - `0` (or `false`) — keep 0% (all dropped for sample-able levels)
   *
   * With `"default"` strategy this rate applies to all non-error/fatal levels.
   * With `"per_level"` strategy this field is **ignored** — unmapped levels
   * default to a fill for levels not present
   * in the `perLevel` map.
   *
   * @default 1
   */
  rate?: boolean | number;

  /**
   * Per-level sampling rates when strategy is `"per_level"`.
   * Keys are log level strings (e.g. `"trace"`, `"info"`, `"warn"`).
   * Levels not listed are kept at 100%.
   *
   * **Important:** "error" and "fatal" default to a 100% keep rate, but can be
   * explicitly overridden by setting their rate in `perLevel` or using a
   * `shouldEmit` callback.
   *
   * The map is snapshotted at construction time; mutating it afterward has
   * no effect.
   *
   * @example
   * ```ts
   * {
   *   strategy: "per_level",
   *   perLevel: {
   *     trace: 0.1,
   *     debug: 0.3,
   *     info: 0.5,
   *   },
   * }
   * // warn, error, fatal are all 100%
   * ```
   */
  perLevel?: Partial<Record<LogLevelType, boolean | number>>;

  /**
   * A custom sampling callback that receives the wide event data and log
   * level, allowing you to make an informed keep/drop decision.
   *
   * When provided, this callback is invoked **in addition to** the built-in
   * rate-based sampling. An event is only kept when **both** the built-in
   * check passes (if `rate`/`perLevel` are configured) **and** the callback
   * returns `true`. If only `shouldEmit` is set (no `rate`), the callback
   * acts as the sole gate.
   *
   * **Note:** "error" and "fatal" default to a 100% keep rate, but can be
   * overridden by returning `false` from this callback.
   *
   * @example
   * ```ts
   * {
   *   shouldEmit: ({ wideData, level }) => {
   *     // Only emit wide events that have a userId
   *     return !!wideData.userId;
   *   },
   * }
   * ```
   */
  shouldEmit?: (params: WideEventSamplingParams) => boolean;

  /**
   * Override the default log level when no explicit `level` is passed to
   * `emitWideEvent()`. When set, the resolved level uses this value instead
   * of `"info"`. This **does** affect sampling decisions — with `per_level`
   * strategy, the level from `emitLevel` determines which rate bucket applies.
   *
   * @default undefined (falls back to `"info"`)
   */
  emitLevel?: LogLevelType;
}

/**
 * Configuration options for creating a wide event mixin.
 */
export interface WideEventMixinOptions {
  /**
   * An async context implementation for propagating wide event data across async boundaries.
   *
   * For Node.js, use `new AsyncLocalStorage()` from `async_hooks`.
   * For browser environments, provide your own compatible implementation.
   */
  asyncContext: AsyncLocalStorage<Record<string, any>>;

  /**
   * Optional: Include data from withContext() calls in the emitted wide event.
   * When true, context data accumulated via withContext() will be included.
   * @default true
   */
  includeContext?: boolean;

  /**
   * Optional: Field name to nest all wide event data under.
   * When set, the wide event data will be wrapped in an object with this key.
   * When undefined (default), wide event data is flattened at the root level.
   * @default undefined
   * @example
   * // With wideEventField: "event"
   * { "event": { "userId": "123", "orderId": "456" }, "msg": "done" }
   * // Without wideEventField (default)
   * { "userId": "123", "orderId": "456", "msg": "done" }
   */
  wideEventField?: string;

  /**
   * Optional: Field name to use for error data in wide events.
   * @default "error" (single mode) or "errors" (array mode)
   */
  errorField?: string;

  /**
   * Optional: When true, errors are collected as an array.
   * Each call to withWideEventError() appends to the array.
   * When false, each call replaces the previous error.
   * @default false
   */
  errorsAsArray?: boolean;

  /**
   * Optional: Sampling configuration for wide events.
   * When provided, the mixin will randomly decide whether to emit or skip wide
   * events based on the configured rate(s).
   *
   * "error" and "fatal" default to a 100% keep rate, but can be overridden
   * via `perLevel` rates or the `shouldEmit` callback.
   *
   * @example
   * // Keep ~10% of wide events (excluding errors/fatals)
   * { sampling: { strategy: "default", rate: 0.1 } }
   *
   * // Per-level: keep all trace/debug, but sample info at 5%
   * { sampling: { strategy: "per_level", perLevel: { info: 0.05 } } }
   */
  sampling?: WideEventSamplingConfig;
}

/**
 * Configuration for emitting a wide event.
 */
export interface EmitWideEventConfig {
  /**
   * The log message for the wide event.
   */
  message: string;

  /**
   * Optional: Log level (defaults to "info").
   */
  level?: LogLevelType;
}

/**
 * Interface for wide event mixin functionality.
 */
export interface IWideEventMixin {
  /**
   * Accumulates data into the wide event.
   * Can be called multiple times to build up the event.
   * Nested objects are deep merged rather than replaced entirely.
   *
   * @param data - Key-value pairs to add to the wide event
   * @returns This logger instance for chaining
   *
   * @example
   * ```typescript
   * // Setup context boundary once (e.g., in middleware)
   * asyncContext.run({}, () => {});
   *
   * // Use anywhere in async chain - no wrapping needed!
   * logger.withWideEvents({ userId: "123" });
   * await processOrder();
   * logger.withWideEvents({ orderId: "456" });
   * ```
   */
  withWideEvents(data: Record<string, any>): this;

  /**
   * Retrieves the currently accumulated wide event data.
   * Returns undefined if called outside async context or if no data has been accumulated.
   *
   * @param key - Optional: Retrieve a specific key from the accumulated data
   * @returns The accumulated data, a specific key's value, or undefined
   *
   * @example
   * ```typescript
   * logger.withWideEvents({ userId: "123" });
   * logger.withWideEvents({ orderId: "456" });
   *
   * // Get all accumulated data
   * const data = logger.getWideEvents();
   * // { userId: "123", orderId: "456" }
   *
   * // Get specific key
   * const userId = logger.getWideEvents("userId");
   * // "123"
   * ```
   */
  getWideEvents(key?: string): Record<string, any> | any;

  /**
   * Clears the accumulated wide event data.
   * Useful when starting a new operation within the same async context.
   *
   * @param key - Optional: Clear only a specific key instead of all data
   * @returns This logger instance for chaining
   *
   * @example
   * ```typescript
   * // Clear all wide event data
   * logger.withWideEvents({ first: "data" });
   * logger.emitWideEvent({ message: "First event" });
   * logger.clearWideEvents();
   * logger.withWideEvents({ second: "data" });
   * logger.emitWideEvent({ message: "Second event" });
   *
   * // Clear specific key
   * logger.withWideEvents({ user: { id: "123", name: "Alice" } });
   * logger.clearWideEvents("user");
   * // Result: user object is removed
   * ```
   */
  clearWideEvents(key?: string): this;

  /**
   * Emits the accumulated wide event as a single log entry.
   * Reads accumulated data from AsyncLocalStorage, merges with current context,
   * and logs at the specified level.
   *
   * @param config - Configuration for the wide event emission
   *
   * @example
   * ```typescript
   * // Emit as info log
   * logger.emitWideEvent({ message: "Order processed" });
   *
   * // Emit as error
   * logger.emitWideEvent({
   *   message: "Order failed",
   *   level: "error",
   * });
   * ```
   */
  emitWideEvent(config: EmitWideEventConfig): void;

  /**
   * Captures an error for inclusion in the wide event.
   * Serializes the error using the configured errorSerializer (or default).
   *
   * @param error - The error to capture
   * @returns This logger instance for chaining
   *
   * @example
   * ```typescript
   * try {
   *   await doSomething();
   * } catch (err) {
   *   // For single error (replaces previous)
   *   logger.withWideEventError(err);
   *
   *   // With errorsAsArray: true - errors accumulate
   *   logger.withWideEventError(err).withWideEventError(otherErr);
   * }
   * ```
   */
  withWideEventError(error: any): this;
}

// Module augmentation for ILogLayer and ILogBuilder
declare module "loglayer" {
  interface LogLayer extends IWideEventMixin {}

  interface MockLogLayer extends IWideEventMixin {}

  interface LogBuilder extends IWideEventMixin {}

  interface MockLogBuilder extends IWideEventMixin {}
}

declare module "@loglayer/shared" {
  interface ILogLayer<This> extends IWideEventMixin {}

  interface ILogBuilder<This> extends IWideEventMixin {}
}
