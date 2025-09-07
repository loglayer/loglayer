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
  logLevel?: LogLevel;
  /**
   * If `true`, copies the `error.message` if available to the transport library's
   * message property.
   *
   * If the config option `error.copyMsgOnOnlyError` is enabled, this property
   * can be set to `true` to disable the behavior for this specific log entry.
   */
  copyMsg?: boolean;
}

export interface LogLayerCommonDataParams {
  /**
   * Combined object data containing the metadata, context, and / or error data in a
   * structured format configured by the user.
   */
  data?: Record<string, any>;
  /**
   * Individual metadata object passed to the log message method.
   */
  metadata?: Record<string, any>;
  /**
   * Error passed to the log message method.
   */
  error?: any;
  /**
   * Context data that is included with each log entry.
   */
  context?: Record<string, any>;
}
