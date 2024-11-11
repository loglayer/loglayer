import type { LogLayerPlugin } from "@loglayer/plugin";
import type { LogLevel, MessageDataType } from "@loglayer/shared";
import type { LogLayerTransport } from "@loglayer/transport";

export { LogLevel } from "@loglayer/shared";

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

export type ErrorSerializerType = (err: any) => Record<string, any> | string;

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

export interface LogLayerConfig {
  /**
   * The prefix to prepend to all log messages
   */
  prefix?: string;
  /**
   * Set to false to drop all log input and stop sending to the logging
   * library.
   *
   * Can be re-enabled with `enableLogging()`.
   *
   * Default is `true`.
   */
  enabled?: boolean;
  /**
   * If set to true, will also output messages via console logging before
   * sending to the logging library.
   *
   * Useful for troubleshooting a logging library / transports
   * to ensure logs are still being created when the underlying
   * does not print anything.
   */
  consoleDebug?: boolean;
  /**
   * The transport(s) that implements a logging library to send logs to.
   * Can be a single transport or an array of transports.
   */
  transport: LogLayerTransport | Array<LogLayerTransport>;
  /**
   * Plugins to use.
   */
  plugins?: Array<LogLayerPlugin>;

  /**
   * A function that takes in an incoming Error type and transforms it into an object.
   * Used in the event that the logging library does not natively support serialization of errors.
   */
  errorSerializer?: ErrorSerializerType;
  /**
   * Logging libraries may require a specific field name for errors so it knows
   * how to parse them.
   *
   * Default is 'err'.
   */
  errorFieldName?: string;
  /**
   * If true, always copy error.message if available as a log message along
   * with providing the error data to the logging library.
   *
   * Can be overridden individually by setting `copyMsg: false` in the `onlyError()`
   * call.
   *
   * Default is false.
   */
  copyMsgOnOnlyError?: boolean;
  /**
   * If set to true, the error will be included as part of metadata instead of
   * of the root of the log data.
   *
   * metadataFieldName must be set to true for this to work.
   *
   * Default is false.
   */
  errorFieldInMetadata?: boolean;
  /**
   * If specified, will set the context object to a specific field
   * instead of flattening the data alongside the error and message.
   *
   * Default is context data will be flattened.
   */
  contextFieldName?: string;
  /**
   * If specified, will set the metadata data to a specific field
   * instead of flattening the data alongside the error and message.
   *
   * Default is metadata will be flattened.
   */
  metadataFieldName?: string;
  /**
   * If set to true, will not include context data in the log message.
   */
  muteContext?: boolean;
  /**
   * If set to true, will not include metadata data in the log message.
   */
  muteMetadata?: boolean;
}
