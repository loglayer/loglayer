import type { ErrorDataType, LogLevel, LoggerType, MessageDataType } from "./common.types";

import type { LogLayerPlugin } from "./plugins.types";

export * from "./plugins.types";
export * from "./common.types";

/**
 * Logging methods that are common to logging libraries
 */
export interface LoggerLibrary {
  info(...data: any[]): void;
  warn(...data: any[]): void;
  error(...data: any[]): void;
  trace?: (...data: any[]) => void;
  debug(...data: any[]): void;
  fatal?: (...data: any[]) => void;
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
}

export interface ILogLayer<ExternalLogger extends LoggerLibrary = LoggerLibrary, ErrorType = ErrorDataType>
  extends ILogBuilder {
  /**
   * Calls child() and sets the prefix to be included with every log message.
   */
  withPrefix(string: string): ILogBuilder;
  /**
   * Appends context data which will be included with
   * every log entry.
   */
  withContext(context: Record<string, any>): ILogLayer<ExternalLogger, ErrorType>;
  /**
   * Specifies metadata to include with the log message
   */
  withMetadata(metadata: Record<string, any>): ILogBuilder;
  /**
   * Specifies an Error to include with the log message
   */
  withError(error: ErrorType): ILogBuilder;
  /**
   * Logs only the error object without a log message
   */
  errorOnly(error: ErrorType, opts?: ErrorOnlyOpts): void;
  /**
   * Logs only metadata without a log message
   */
  metadataOnly(metadata: Record<string, any>, logLevel: LogLevel): void;

  /**
   * Returns the underlying log instance
   */
  getLoggerInstance(): ExternalLogger;

  /**
   * Returns the context used for the logger
   */
  getContext(): Record<string, any>;

  /**
   * Creates a new instance of LogLayer but with the initialization
   * configuration and context data copied over.
   *
   * The copied context data is a *shallow copy*.
   */
  child(): ILogBuilder;

  /**
   * Disables inclusion of context data in the print
   */
  muteContext(): ILogLayer<ExternalLogger, ErrorType>;
  /**
   * Enables inclusion of context data in the print
   */
  unMuteContext(): ILogLayer<ExternalLogger, ErrorType>;
  /**
   * Disables inclusion of metadata data in the print
   */
  muteMetadata(): ILogLayer<ExternalLogger, ErrorType>;
  /**
   * Enables inclusion of metadata data in the print
   */
  unMuteMetadata(): ILogLayer<ExternalLogger, ErrorType>;
}

export type ErrorSerializerType<ErrorType> = (err: ErrorType) => Record<string, any> | string;

export interface ErrorOnlyOpts {
  /**
   * Sets the log level of the error
   */
  logLevel?: LogLevel;
  /**
   * If `true`, copies the `error.message` if available to the logger library's
   * message property.
   *
   * If the config option `error.copyMsgOnOnlyError` is enabled, this property
   * can be set to `true` to disable the behavior for this specific log entry.
   */
  copyMsg?: boolean;
}

export interface LogLayerErrorConfig<ErrorType> {
  /**
   * A function that takes in an incoming Error type and transforms it into an object.
   * Used in the event that the logging library does not natively support serialization of errors.
   */
  serializer?: ErrorSerializerType<ErrorType>;
  /**
   * Logging libraries may require a specific field name for errors so it knows
   * how to parse them.
   *
   * Default is 'err'.
   */
  fieldName?: string;
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
}

export interface LogLayerContextConfig {
  /**
   * If specified, will set the context object to a specific field
   * instead of flattening the data alongside the error and message.
   *
   * Default is context data will be flattened.
   */
  fieldName?: string;
}

export interface LogLayerMetadataConfig {
  /**
   * If specified, will set the metadata data to a specific field
   * instead of flattening the data alongside the error and message.
   *
   * Default is metadata will be flattened.
   */
  fieldName?: string;
}

export interface LogLayerConfig<ErrorType = ErrorDataType> {
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
  logger: {
    /**
     * The instance of the logging library to send log data and messages to
     */
    instance: LoggerLibrary;
    /**
     * The instance type of the logging library being used
     */
    type: LoggerType;
  };
  error?: LogLayerErrorConfig<ErrorType>;
  metadata?: LogLayerMetadataConfig;
  context?: LogLayerContextConfig;
  plugins?: Array<LogLayerPlugin>;
  /**
   * If set to true, will not include context data in the log message.
   */
  muteContext?: boolean;
  /**
   * If set to true, will not include metadata data in the log message.
   */
  muteMetadata?: boolean;
}
