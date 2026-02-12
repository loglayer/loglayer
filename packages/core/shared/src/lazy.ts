/**
 * Symbol used to identify lazy values in context and metadata.
 * @internal
 */
export const LAZY_SYMBOL: unique symbol = Symbol.for("loglayer.lazy");

/**
 * Represents a lazy value that defers evaluation until log time.
 *
 * Created by the {@link lazy} function.
 *
 * @see {@link https://loglayer.dev/logging-api/lazy-evaluation | Lazy Evaluation Docs}
 */
export interface LazyLogValue {
  [LAZY_SYMBOL]: () => any;
}

/**
 * Wraps a callback function to defer its evaluation until log time.
 *
 * The callback will only be invoked if the log level is enabled,
 * avoiding unnecessary computation for disabled log levels.
 *
 * Can be used in both `withContext()` and `withMetadata()` at the root level.
 *
 * Comes from [LogTape's lazy evaluation](https://logtape.org/manual/lazy).
 *
 * @example
 * ```typescript
 * import { LogLayer, lazy } from "loglayer";
 *
 * const log = new LogLayer({ ... });
 *
 * // Dynamic context - evaluated on each log call
 * log.withContext({
 *   memoryUsage: lazy(() => process.memoryUsage().heapUsed),
 * });
 *
 * // Dynamic metadata - evaluated only if debug is enabled
 * log.withMetadata({
 *   data: lazy(() => JSON.stringify(largeObject)),
 * }).debug("Processing complete");
 * ```
 *
 * @see {@link https://loglayer.dev/logging-api/lazy-evaluation | Lazy Evaluation Docs}
 */
export function lazy(fn: () => any): LazyLogValue {
  return {
    [LAZY_SYMBOL]: fn,
  };
}

/**
 * Checks if a value is a lazy value created by {@link lazy}.
 * @internal
 */
export function isLazy(value: unknown): value is LazyLogValue {
  return value != null && typeof value === "object" && LAZY_SYMBOL in value;
}

/**
 * Resolves any lazy values in a record at the root level.
 * Returns the original object if no lazy values are found (optimization).
 * @internal
 */
export function resolveLazyValues<T extends Record<string, any>>(obj: T): T {
  let hasLazy = false;

  for (const key of Object.keys(obj)) {
    if (isLazy(obj[key])) {
      hasLazy = true;
      break;
    }
  }

  if (!hasLazy) return obj;

  const result: Record<string, any> = {};

  for (const key of Object.keys(obj)) {
    const value = obj[key];
    result[key] = isLazy(value) ? value[LAZY_SYMBOL]() : value;
  }

  return result as T;
}
