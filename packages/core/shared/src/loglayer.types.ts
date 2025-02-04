import type { ErrorOnlyOpts, LogLevel, MessageDataType } from "./common.types.js";
import type { LogLayerPlugin } from "./plugin.types.js";

export interface LogLayerTransportParams {
  /**
   * The log level of the message
   */
  logLevel: LogLevel;
  /**
   * The parameters that were passed to the log message method (eg: info / warn / debug / error)
   */
  messages: any[];
  /**
   * Object data such as metadata, context, and / or error data
   */
  data?: Record<string, any>;
  /**
   * If true, the data object is included in the message parameters
   */
  hasData?: boolean;
}

export interface LogLayerTransport<LogLibrary = any> {
  /**
   * A user-defined identifier for the transport
   **/
  id?: string;
  /**
   * If false, the transport will not send logs to the logger.
   * Default is true.
   */
  enabled?: boolean;
  /**
   * Sends the log data to the logger for transport
   */
  shipToLogger(params: LogLayerTransportParams): any[];

  /**
   * Internal use only. Do not implement.
   * @param params
   */
  _sendToLogger(params: LogLayerTransportParams): void;

  /**
   * Returns the logger instance attached to the transport
   */
  getLoggerInstance(): LogLibrary;
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
   *
   * {@link https://loglayer.dev/logging-api/basic-logging.html#message-prefixing | Message Prefixing Docs}
   */
  withPrefix(string: string): ILogLayer;
  /**
   * Appends context data which will be included with
   * every log entry.
   *
   * {@link https://loglayer.dev/logging-api/context.html | Context Docs}
   */
  withContext(context: Record<string, any>): ILogLayer;
  /**
   * Specifies metadata to include with the log message
   *
   * {@link https://loglayer.dev/logging-api/metadata.html | Metadata Docs}
   */
  withMetadata(metadata: Record<string, any>): ILogBuilder;
  /**
   * Specifies an Error to include with the log message
   *
   * {@link https://loglayer.dev/logging-api/error-handling.html | Error Handling Docs}
   */
  withError(error: any): ILogBuilder;
  /**
   * Logs only the error object without a log message
   *
   * {@link https://loglayer.dev/logging-api/error-handling.html | Error Handling Docs}
   */
  errorOnly(error: any, opts?: ErrorOnlyOpts): void;
  /**
   * Logs only metadata without a log message
   *
   * {@link https://loglayer.dev/logging-api/metadata.html | Metadata Docs}
   */
  metadataOnly(metadata: Record<string, any>, logLevel?: LogLevel): void;

  /**
   * Returns the context used
   *
   * {@link https://loglayer.dev/logging-api/context.html | Context Docs}
   */
  getContext(): Record<string, any>;

  /**
   * Creates a new instance of LogLayer but with the initialization
   * configuration and context data copied over.
   *
   * The copied context data is a *shallow copy*.
   *
   * {@link https://loglayer.dev/logging-api/child-loggers.html | Child Logging Docs}
   */
  child(): ILogLayer;

  /**
   * Disables inclusion of context data in the print
   *
   * {@link https://loglayer.dev/logging-api/context.html#managing-context | Managing Context Docs}
   */
  muteContext(): ILogLayer;
  /**
   * Enables inclusion of context data in the print
   *
   * {@link https://loglayer.dev/logging-api/context.html#managing-context | Managing Context Docs}
   */
  unMuteContext(): ILogLayer;
  /**
   * Disables inclusion of metadata data in the print
   *
   * {@link https://loglayer.dev/logging-api/metadata.html#controlling-metadata-output | Controlling Metadata Output Docs}
   */
  muteMetadata(): ILogLayer;
  /**
   * Enables inclusion of metadata data in the print
   *
   * {@link https://loglayer.dev/logging-api/metadata.html#controlling-metadata-output | Controlling Metadata Output Docs}
   */
  unMuteMetadata(): ILogLayer;
  /**
   * Enable sending logs to the logging library.
   *
   * {@link https://loglayer.dev/logging-api/basic-logging.html#enabling-disabling-logging | Enabling/Disabling Logging Docs}
   */
  enableLogging(): ILogLayer;
  /**
   * All logging inputs are dropped and stops sending logs to the logging library.
   *
   * {@link https://loglayer.dev/logging-api/basic-logging.html#enabling-disabling-logging | Enabling/Disabling Logging Docs}
   */
  disableLogging(): ILogLayer;

  /**
   * Returns a logger instance for a specific transport
   *
   * {@link https://loglayer.dev/logging-api/transport-management.html | Transport Management Docs}
   */
  getLoggerInstance<Library>(id: string): Library | undefined;

  /**
   * Replaces all existing transports with new ones while preserving other logger configuration.
   * When used with child loggers, it only affects the current logger instance
   * and does not modify the parent's transports.
   *
   * {@link https://loglayer.dev/logging-api/transport-management.html | Transport Management Docs}
   */
  withFreshTransports(transports: LogLayerTransport | Array<LogLayerTransport>): ILogLayer;

  /**
   * Replaces all existing plugins with new ones.
   *
   * When used with child loggers, it only affects the current logger instance
   * and does not modify the parent's plugins.
   *
   * {@link https://loglayer.dev/plugins/ | Plugins Docs}
   */
  withFreshPlugins(plugins: Array<LogLayerPlugin>): ILogLayer;
}
