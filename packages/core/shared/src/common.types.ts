export enum LogLevel {
  info = "info",
  warn = "warn",
  error = "error",
  debug = "debug",
  trace = "trace",
  fatal = "fatal",
}

export type MessageDataType = string | number | null | undefined;

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
