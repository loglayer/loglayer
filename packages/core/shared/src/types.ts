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

export interface ILogBuilder {
  /**
   * Sends a log message to the logging library under an info log level.
   *
   * The logging library may or may not support multiple message parameters and only
   * the first parameter would be used.
   */
  info(...messages: MessageDataType[]): void;
  /**
   * Sends a log message to the logging library under the warn log level
   *
   * The logging library may or may not support multiple message parameters and only
   * the first parameter would be used.
   */
  warn(...messages: MessageDataType[]): void;
  /**
   * Sends a log message to the logging library under the error log level
   *
   * The logging library may or may not support multiple message parameters and only
   * the first parameter would be used.
   */
  error(...messages: MessageDataType[]): void;
  /**
   * Sends a log message to the logging library under the debug log level
   *
   * The logging library may or may not support multiple message parameters and only
   * the first parameter would be used.
   */
  debug(...messages: MessageDataType[]): void;
  /**
   * Sends a log message to the logging library under the trace log level
   *
   * The logging library may or may not support multiple message parameters and only
   * the first parameter would be used.
   */
  trace(...messages: MessageDataType[]): void;
  /**
   * Sends a log message to the logging library under the fatal log level
   *
   * The logging library may or may not support multiple message parameters and only
   * the first parameter would be used.
   */
  fatal(...messages: MessageDataType[]): void;
  /**
   * Specifies metadata to include with the log message
   */
  withMetadata(metadata: Record<string, any>): ILogBuilder;
  /**
   * Specifies an Error to include with the log message
   */
  withError(error: any): ILogBuilder;
  /**
   * Enable sending logs to the logging library.
   */
  enableLogging(): ILogBuilder;
  /**
   * All logging inputs are dropped and stops sending logs to the logging library.
   */
  disableLogging(): ILogBuilder;
}

export interface ILogLayer extends ILogBuilder {
  /**
   * Calls child() and sets the prefix to be included with every log message.
   */
  withPrefix(string: string): ILogLayer;
  /**
   * Appends context data which will be included with
   * every log entry.
   */
  withContext(context: Record<string, any>): ILogLayer;
  /**
   * Specifies metadata to include with the log message
   */
  withMetadata(metadata: Record<string, any>): ILogBuilder;
  /**
   * Specifies an Error to include with the log message
   */
  withError(error: any): ILogBuilder;
  /**
   * Logs only the error object without a log message
   */
  errorOnly(error: any, opts?: ErrorOnlyOpts): void;
  /**
   * Logs only metadata without a log message
   */
  metadataOnly(metadata: Record<string, any>, logLevel: LogLevel): void;

  /**
   * Returns the context used
   */
  getContext(): Record<string, any>;

  /**
   * Creates a new instance of LogLayer but with the initialization
   * configuration and context data copied over.
   *
   * The copied context data is a *shallow copy*.
   */
  child(): ILogLayer;

  /**
   * Disables inclusion of context data in the print
   */
  muteContext(): ILogLayer;
  /**
   * Enables inclusion of context data in the print
   */
  unMuteContext(): ILogLayer;
  /**
   * Disables inclusion of metadata data in the print
   */
  muteMetadata(): ILogLayer;
  /**
   * Enables inclusion of metadata data in the print
   */
  unMuteMetadata(): ILogLayer;
  /**
   * Enable sending logs to the logging library.
   */
  enableLogging(): ILogLayer;
  /**
   * All logging inputs are dropped and stops sending logs to the logging library.
   */
  disableLogging(): ILogLayer;

  /**
   * Returns the logger instance for the specified library.
   */
  getLoggerInstance<Library>(id: string): Library | undefined;
}
