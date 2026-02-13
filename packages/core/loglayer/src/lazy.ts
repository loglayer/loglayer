/**
 * Symbol used to identify lazy values in context and metadata.
 * @internal
 */
export const LAZY_SYMBOL: unique symbol = Symbol.for("loglayer.lazy");

/**
 * String constant used as a replacement value when a lazy callback fails during evaluation.
 * Exported so users can programmatically detect lazy evaluation failures in their log output.
 *
 * @see {@link https://loglayer.dev/logging-api/lazy-evaluation#error-handling | Lazy Evaluation Error Handling Docs}
 */
export const LAZY_EVAL_ERROR = "[LazyEvalError]";

/**
 * Describes a single lazy evaluation failure.
 * @internal
 */
export interface LazyEvalFailure {
  key: string;
  error: unknown;
}

/**
 * Result of resolving lazy values, including any errors that occurred.
 * @internal
 */
export interface ResolveLazyResult<T> {
  resolved: T;
  errors: LazyEvalFailure[] | null;
}

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
 * If a lazy callback throws, the value is replaced with LAZY_EVAL_ERROR
 * and the error is collected in the result.
 * @internal
 */
export function resolveLazyValues<T extends Record<string, any>>(obj: T): ResolveLazyResult<T> {
  let hasLazy = false;

  for (const key of Object.keys(obj)) {
    if (isLazy(obj[key])) {
      hasLazy = true;
      break;
    }
  }

  if (!hasLazy) return { resolved: obj, errors: null };

  const result: Record<string, any> = {};
  let errors: LazyEvalFailure[] | null = null;

  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (isLazy(value)) {
      try {
        result[key] = value[LAZY_SYMBOL]();
      } catch (e) {
        result[key] = LAZY_EVAL_ERROR;
        if (!errors) errors = [];
        errors.push({ key, error: e });
      }
    } else {
      result[key] = value;
    }
  }

  return { resolved: result as T, errors };
}

/**
 * Checks if any values in a record are Promises.
 * @internal
 */
export function hasPromiseValues(obj: Record<string, any>): boolean {
  for (const key of Object.keys(obj)) {
    if (obj[key] instanceof Promise) {
      return true;
    }
  }
  return false;
}

/**
 * Replaces any Promise values in a record with LAZY_EVAL_ERROR.
 * Used to strip async lazy values from context where only sync lazy is supported.
 * Returns the keys that were replaced.
 * @internal
 */
export function replacePromiseValues<T extends Record<string, any>>(
  obj: T,
): { resolved: T; asyncKeys: string[] | null } {
  let asyncKeys: string[] | null = null;
  const result: Record<string, any> = {};

  for (const key of Object.keys(obj)) {
    if (obj[key] instanceof Promise) {
      result[key] = LAZY_EVAL_ERROR;
      if (!asyncKeys) asyncKeys = [];
      asyncKeys.push(key);
    } else {
      result[key] = obj[key];
    }
  }

  if (!asyncKeys) return { resolved: obj, asyncKeys: null };
  return { resolved: result as T, asyncKeys };
}

/**
 * Resolves any Promise values in a record using Promise.allSettled.
 * If a Promise rejects, the value is replaced with LAZY_EVAL_ERROR
 * and the error is collected in the result.
 * @internal
 */
export async function resolvePromiseValues<T extends Record<string, any>>(obj: T): Promise<ResolveLazyResult<T>> {
  const keys = Object.keys(obj);
  const settled = await Promise.allSettled(keys.map((key) => Promise.resolve(obj[key])));

  const result: Record<string, any> = {};
  let errors: LazyEvalFailure[] | null = null;

  for (let i = 0; i < keys.length; i++) {
    const s = settled[i];
    if (s.status === "fulfilled") {
      result[keys[i]] = s.value;
    } else {
      result[keys[i]] = LAZY_EVAL_ERROR;
      if (!errors) errors = [];
      errors.push({ key: keys[i], error: s.reason });
    }
  }

  return { resolved: result as T, errors };
}
