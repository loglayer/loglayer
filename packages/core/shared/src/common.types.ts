import type { LazyLogValue } from "./lazy.js";

export enum LogLevel {
  info = "info",
  warn = "warn",
  error = "error",
  debug = "debug",
  trace = "trace",
  fatal = "fatal",
}

/**
 * Combination of the LogLevel enum and its string representations.
 */
export type LogLevelType = LogLevel | `${LogLevel}`;

/**
 * Mapping of log levels to their numeric values.
 */
export const LogLevelPriority: Record<LogLevel, number> = {
  [LogLevel.trace]: 10,
  [LogLevel.debug]: 20,
  [LogLevel.info]: 30,
  [LogLevel.warn]: 40,
  [LogLevel.error]: 50,
  [LogLevel.fatal]: 60,
};

/**
 * Mapping of numeric values to their log level names.
 */
export const LogLevelPriorityToNames = {
  10: LogLevel.trace,
  20: LogLevel.debug,
  30: LogLevel.info,
  40: LogLevel.warn,
  50: LogLevel.error,
  60: LogLevel.fatal,
};

export type MessageDataType = string | number | boolean | null | undefined;

/**
 * Options for the `errorOnly` method.
 * @see {@link https://loglayer.dev/logging-api/error-handling.html#error-only-logging | Error Only Logging Doc}
 */
export interface ErrorOnlyOpts {
  /**
   * Sets the log level of the error
   */
  logLevel?: LogLevelType;
  /**
   * If `true`, copies the `error.message` if available to the transport library's
   * message property.
   *
   * If the config option `error.copyMsgOnOnlyError` is enabled, this property
   * can be set to `true` to disable the behavior for this specific log entry.
   */
  copyMsg?: boolean;
}

/**
 * Defines the structure for context data that persists across multiple log entries
 * within the same context scope. This is set using log.withContext().
 */
export interface LogLayerContext extends Record<string, any> {}

/**
 * Defines the structure for metadata that can be attached to individual log entries.
 * This is set using log.withMetadata() or log.metadataOnly().
 */
export interface LogLayerMetadata extends Record<string, any> {}

/**
 * Used internally by LogLayer when assembling the final data object (metadata / context / error) sent to transports.
 */
export interface LogLayerData extends Record<string, any> {}

/**
 * Type-level helper that checks whether a metadata/context record type
 * contains any {@link LazyLogValue} whose callback returns a `Promise`.
 *
 * Evaluates to `true` if any property is `LazyLogValue<Promise<any>>`,
 * `false` otherwise. Returns `false` for `undefined` or `null` inputs.
 *
 * @see {@link https://loglayer.dev/logging-api/lazy-evaluation | Lazy Evaluation Docs}
 */
export type ContainsAsyncLazy<M> = M extends undefined | null
  ? false
  : true extends {
        [K in keyof M]: M[K] extends LazyLogValue<infer T> ? (T extends Promise<any> ? true : false) : false;
      }[keyof M]
    ? true
    : false;

/**
 * Helper type that resolves the return type of log methods based on whether
 * async lazy values are present.
 *
 * - `true` → `Promise<void>` (async lazy values detected)
 * - `false` → `void` (no async lazy values)
 * - `boolean` → `void | Promise<void>` (indeterminate, used by implementation classes)
 */
export type LogReturnType<IsAsync extends boolean> = IsAsync extends true
  ? Promise<void>
  : IsAsync extends false
    ? undefined
    : void | Promise<void>;

export interface LogLayerCommonDataParams {
  /**
   * Combined object data containing the metadata, context, and / or error data in a
   * structured format configured by the user.
   */
  data?: LogLayerData;
  /**
   * Individual metadata object passed to the log message method.
   */
  metadata?: LogLayerMetadata;
  /**
   * Error passed to the log message method.
   */
  error?: any;
  /**
   * Context data that is included with each log entry.
   */
  context?: LogLayerContext;
}
