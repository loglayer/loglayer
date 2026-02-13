import type {
  ErrorOnlyOpts,
  LogLayerCommonDataParams,
  LogLayerContext,
  LogLayerMetadata,
  LogLevelType,
  MessageDataType,
} from "./common.types.js";
import type { LogLayerPlugin } from "./plugin.types.js";

/**
 * Interface for raw log entries that allows complete control over all aspects of a log entry.
 *
 * @see {@link https://loglayer.dev/logging-api/basic-logging.html#raw-logging | Raw Logging Documentation}
 */
export interface RawLogEntry {
  /**
   * Context data to include with the log entry.
   *
   * - When provided, this context data will be used instead of the context manager.
   * - If not provided, the context manager data will be used instead
   * - An empty object will result in no context data being used at all
   */
  context?: LogLayerContext;

  /**
   * Metadata to include with the log entry.
   */
  metadata?: LogLayerMetadata;

  /**
   * Error object to include with the log entry.
   */
  error?: any;

  /**
   * The log level for this entry.
   */
  logLevel: LogLevelType;

  /**
   * Array of message parameters to log.
   *
   * These are the actual log messages and can include strings, numbers,
   * booleans, null, or undefined values. The first string message will
   * have any configured prefix applied to it.
   */
  messages?: MessageDataType[];
}

/**
 * Context Manager callback function for when a child logger is created.
 * @see {@link https://loglayer.dev/context-managers/creating-context-managers.html | Creating Context Managers Docs}
 */
export interface OnChildLoggerCreatedParams {
  /**
   * The parent logger instance
   */
  parentLogger: ILogLayer<any>;
  /**
   * The child logger instance
   */
  childLogger: ILogLayer<any>;
  /**
   * The parent logger's context manager
   */
  parentContextManager: IContextManager;
  /**
   * The child logger's context manager
   */
  childContextManager: IContextManager;
}

/**
 * Interface for implementing a context manager instance.
 *
 * If your context manager needs to clean up resources (like file handles, memory, or external connections),
 * you can optionally implement the {@link https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-2.html#using-declarations-and-explicit-resource-management | Disposable} interface.
 * LogLayer will automatically call the dispose method when the context manager is replaced using `withContextManager()`.
 *
 * @see {@link https://loglayer.dev/context-managers/creating-context-managers.html | Creating Context Managers Docs}
 */
export interface IContextManager {
  /**
   * Sets the context data to be included with every log entry. Set to `undefined` to clear the context data.
   */
  setContext(context?: LogLayerContext): void;
  /**
   * Appends context data to the existing context data.
   */
  appendContext(context: Partial<LogLayerContext>): void;
  /**
   * Returns the context data to be included with every log entry.
   */
  getContext(): LogLayerContext;
  /**
   * Returns true if context data is present.
   */
  hasContextData(): boolean;
  /**
   * Clears the context data. If keys are provided, only those keys will be removed.
   * If no keys are provided, all context data will be cleared.
   */
  clearContext(keys?: string | string[]): void;
  /**
   * Called when a child logger is created. Use to manipulate context data between parent and child.
   */
  onChildLoggerCreated(params: OnChildLoggerCreatedParams): void;
  /**
   * Creates a new instance of the context manager with the same context data.
   */
  clone(): IContextManager;
}

/**
 * Log Level Manager callback function for when a child logger is created.
 */
export interface OnChildLogLevelManagerCreatedParams {
  /**
   * The parent logger instance
   */
  parentLogger: ILogLayer<any>;
  /**
   * The child logger instance
   */
  childLogger: ILogLayer<any>;
  /**
   * The parent logger's log level manager
   */
  parentLogLevelManager: ILogLevelManager;
  /**
   * The child logger's log level manager
   */
  childLogLevelManager: ILogLevelManager;
}

/**
 * Interface for implementing a log level manager instance.
 *
 * Log level managers are responsible for managing log level settings across logger instances.
 * They control how log levels are inherited and propagated between parent and child loggers.
 *
 * If your log level manager needs to clean up resources (like parent-child references, memory, or external connections),
 * you can optionally implement the {@link https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-2.html#using-declarations-and-explicit-resource-management | Disposable} interface.
 * LogLayer will automatically call the dispose method when the log level manager is replaced using `withLogLevelManager()`.
 *
 * @see {@link https://loglayer.dev/log-level-managers/creating-log-level-managers.html | Creating Log Level Managers Docs}
 */
export interface ILogLevelManager {
  /**
   * Sets the minimum log level to be used by the logger. Only messages with
   * this level or higher severity will be logged.
   *
   * **When triggered:** Called when `logger.setLevel()` is invoked on a LogLayer instance.
   */
  setLevel(logLevel: LogLevelType): void;
  /**
   * Enables a specific log level.
   *
   * **When triggered:** Called when `logger.enableIndividualLevel()` is invoked on a LogLayer instance.
   */
  enableIndividualLevel(logLevel: LogLevelType): void;
  /**
   * Disables a specific log level.
   *
   * **When triggered:** Called when `logger.disableIndividualLevel()` is invoked on a LogLayer instance.
   */
  disableIndividualLevel(logLevel: LogLevelType): void;
  /**
   * Checks if a specific log level is enabled.
   *
   * **When triggered:** Called before every log method execution (e.g., `info()`, `warn()`, `error()`, `debug()`, `trace()`, `fatal()`, `raw()`, `metadataOnly()`, `errorOnly()`) to determine if the log should be processed. Also called when `logger.isLevelEnabled()` is invoked directly.
   */
  isLevelEnabled(logLevel: LogLevelType): boolean;
  /**
   * Enable sending logs to the logging library.
   *
   * **When triggered:** Called when `logger.enableLogging()` is invoked on a LogLayer instance.
   */
  enableLogging(): void;
  /**
   * All logging inputs are dropped and stops sending logs to the logging library.
   *
   * **When triggered:** Called when `logger.disableLogging()` is invoked on a LogLayer instance, or when a LogLayer instance is created with `enabled: false` in the configuration.
   */
  disableLogging(): void;
  /**
   * Called when a child logger is created. Use to manipulate log level settings between parent and child.
   *
   * **When triggered:** Called automatically when `logger.child()` is invoked, after the child logger is created and the parent's log level manager has been cloned. This allows the manager to establish relationships between parent and child loggers.
   */
  onChildLoggerCreated(params: OnChildLogLevelManagerCreatedParams): void;
  /**
   * Creates a new instance of the log level manager with the same log level settings.
   *
   * **When triggered:** Called automatically when `logger.child()` is invoked to create a new log level manager instance for the child logger. The cloned instance should have the same initial log level state as the parent, but can be modified independently (unless the manager implements shared state behavior).
   */
  clone(): ILogLevelManager;
}

/**
 * Input to the LogLayer transport shipToLogger() method.
 * @see {@link https://loglayer.dev/transports/creating-transports.html | Creating Transports Docs}
 */
export interface LogLayerTransportParams extends LogLayerCommonDataParams {
  /**
   * The log level of the message
   */
  logLevel: LogLevelType;
  /**
   * The parameters that were passed to the log message method (eg: info / warn / debug / error)
   */
  messages: any[];
  /**
   * If true, the data object is included in the message parameters
   */
  hasData?: boolean;
}

/**
 * Interface for implementing a LogLayer transport instance.
 * @see {@link https://loglayer.dev/transports/creating-transports.html | Creating Transports Docs}
 */
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

/**
 * Interface for implementing a LogLayer builder instance.
 * @see {@link https://loglayer.dev | LogLayer Documentation}
 */
export interface ILogBuilder<This = ILogBuilder<any>> {
  /**
   * Sends a log message to the logging library under an info log level.
   * Returns a Promise when async lazy values are present in context or metadata.
   */
  info(...messages: MessageDataType[]): void | Promise<void>;
  /**
   * Sends a log message to the logging library under the warn log level.
   * Returns a Promise when async lazy values are present in context or metadata.
   */
  warn(...messages: MessageDataType[]): void | Promise<void>;
  /**
   * Sends a log message to the logging library under the error log level.
   * Returns a Promise when async lazy values are present in context or metadata.
   */
  error(...messages: MessageDataType[]): void | Promise<void>;
  /**
   * Sends a log message to the logging library under the debug log level.
   * Returns a Promise when async lazy values are present in context or metadata.
   */
  debug(...messages: MessageDataType[]): void | Promise<void>;
  /**
   * Sends a log message to the logging library under the trace log level.
   * Returns a Promise when async lazy values are present in context or metadata.
   */
  trace(...messages: MessageDataType[]): void | Promise<void>;
  /**
   * Sends a log message to the logging library under the fatal log level.
   * Returns a Promise when async lazy values are present in context or metadata.
   */
  fatal(...messages: MessageDataType[]): void | Promise<void>;
  /**
   * Specifies metadata to include with the log message
   *
   * @see {@link https://loglayer.dev/logging-api/metadata.html | Metadata Docs}
   */
  withMetadata(metadata?: LogLayerMetadata): This;
  /**
   * Specifies an Error to include with the log message
   *
   * @see {@link https://loglayer.dev/logging-api/error-handling.html | Error Handling Docs}
   */
  withError(error: any): This;
  /**
   * Enable sending logs to the logging library.
   *
   * @see {@link https://loglayer.dev/logging-api/basic-logging.html#enabling-disabling-logging | Enabling/Disabling Logging Docs}
   */
  enableLogging(): This;
  /**
   * All logging inputs are dropped and stops sending logs to the logging library.
   *
   * @see {@link https://loglayer.dev/logging-api/basic-logging.html#enabling-disabling-logging | Enabling/Disabling Logging Docs}
   */
  disableLogging(): This;
}

/**
 * Interface for implementing a LogLayer logger instance.
 * @see {@link https://loglayer.dev | LogLayer Documentation}
 */
export interface ILogLayer<This = ILogLayer<any>> {
  /**
   * Sends a log message to the logging library under an info log level.
   * Returns a Promise when async lazy values are present in context or metadata.
   */
  info(...messages: MessageDataType[]): void | Promise<void>;
  /**
   * Sends a log message to the logging library under the warn log level.
   * Returns a Promise when async lazy values are present in context or metadata.
   */
  warn(...messages: MessageDataType[]): void | Promise<void>;
  /**
   * Sends a log message to the logging library under the error log level.
   * Returns a Promise when async lazy values are present in context or metadata.
   */
  error(...messages: MessageDataType[]): void | Promise<void>;
  /**
   * Sends a log message to the logging library under the debug log level.
   * Returns a Promise when async lazy values are present in context or metadata.
   */
  debug(...messages: MessageDataType[]): void | Promise<void>;
  /**
   * Sends a log message to the logging library under the trace log level.
   * Returns a Promise when async lazy values are present in context or metadata.
   */
  trace(...messages: MessageDataType[]): void | Promise<void>;
  /**
   * Sends a log message to the logging library under the fatal log level.
   * Returns a Promise when async lazy values are present in context or metadata.
   */
  fatal(...messages: MessageDataType[]): void | Promise<void>;
  /**
   * Specifies metadata to include with the log message
   *
   * @see {@link https://loglayer.dev/logging-api/metadata.html | Metadata Docs}
   */
  withMetadata(metadata?: LogLayerMetadata): ILogBuilder<any>;
  /**
   * Specifies an Error to include with the log message
   *
   * @see {@link https://loglayer.dev/logging-api/error-handling.html | Error Handling Docs}
   */
  withError(error: any): ILogBuilder<any>;
  /**
   * Enable sending logs to the logging library.
   *
   * @see {@link https://loglayer.dev/logging-api/basic-logging.html#enabling-disabling-logging | Enabling/Disabling Logging Docs}
   */
  enableLogging(): This;
  /**
   * All logging inputs are dropped and stops sending logs to the logging library.
   *
   * @see {@link https://loglayer.dev/logging-api/basic-logging.html#enabling-disabling-logging | Enabling/Disabling Logging Docs}
   */
  disableLogging(): This;
  /**
   * Calls child() and sets the prefix to be included with every log message.
   *
   * @see {@link https://loglayer.dev/logging-api/basic-logging.html#message-prefixing | Message Prefixing Docs}
   */
  withPrefix(string: string): This;
  /**
   * Appends context data which will be included with
   * every log entry.
   *
   * Passing in an empty value / object will *not* clear the context.
   *
   * To clear the context, use {@link clearContext}.
   *
   * @see {@link https://loglayer.dev/logging-api/context.html | Context Docs}
   */
  withContext(context?: LogLayerContext): This;
  /**
   * Clears the context data. If keys are provided, only those keys will be removed.
   * If no keys are provided, all context data will be cleared.
   *
   * @see {@link https://loglayer.dev/logging-api/context.html | Context Docs}
   */
  clearContext(keys?: string | string[]): This;
  /**
   * Logs only the error object without a log message
   *
   * @see {@link https://loglayer.dev/logging-api/error-handling.html | Error Handling Docs}
   */
  errorOnly(error: any, opts?: ErrorOnlyOpts): void | Promise<void>;
  /**
   * Logs only metadata without a log message
   *
   * @see {@link https://loglayer.dev/logging-api/metadata.html | Metadata Docs}
   */
  metadataOnly(metadata?: LogLayerMetadata, logLevel?: LogLevelType): void | Promise<void>;

  /**
   * Returns the context used.
   * Without options, returns the raw context (including lazy wrappers).
   *
   * @see {@link https://loglayer.dev/logging-api/context.html | Context Docs}
   */
  getContext(): LogLayerContext;
  /**
   * Returns the context used.
   * With `evalLazy: true`, resolves lazy values. Returns a Promise when async lazy values are present.
   *
   * @see {@link https://loglayer.dev/logging-api/context.html | Context Docs}
   */
  getContext(options: { evalLazy?: boolean }): LogLayerContext | Promise<LogLayerContext>;

  /**
   * Creates a new instance of LogLayer but with the initialization
   * configuration and context data copied over.
   *
   * The copied context data is a *shallow copy*.
   *
   * @see {@link https://loglayer.dev/logging-api/child-loggers.html | Child Logging Docs}
   */
  child(): This;

  /**
   * Disables inclusion of context data in the print
   *
   * @see {@link https://loglayer.dev/logging-api/context.html#managing-context | Managing Context Docs}
   */
  muteContext(): This;
  /**
   * Enables inclusion of context data in the print
   *
   * @see {@link https://loglayer.dev/logging-api/context.html#managing-context | Managing Context Docs}
   */
  unMuteContext(): This;
  /**
   * Disables inclusion of metadata data in the print
   *
   * @see {@link https://loglayer.dev/logging-api/metadata.html#controlling-metadata-output | Controlling Metadata Output Docs}
   */
  muteMetadata(): This;
  /**
   * Enables inclusion of metadata data in the print
   *
   * @see {@link https://loglayer.dev/logging-api/metadata.html#controlling-metadata-output | Controlling Metadata Output Docs}
   */
  unMuteMetadata(): This;
  /**
   * Enables a specific log level
   *
   * @see {@link https://loglayer.dev/logging-api/basic-logging.html#enabling-disabling-logging | Enabling/Disabling Logging Docs}
   */
  enableIndividualLevel(logLevel: LogLevelType): This;
  /**
   * Disables a specific log level
   *
   * @see {@link https://loglayer.dev/logging-api/basic-logging.html#enabling-disabling-logging | Enabling/Disabling Logging Docs}
   */
  disableIndividualLevel(logLevel: LogLevelType): This;
  /**
   * Sets the minimum log level to be used by the logger. Only messages with
   * this level or higher severity will be logged.
   *
   * For example, if you setLevel(LogLevel.warn), this will:
   * Enable:
   * - warn
   * - error
   * - fatal
   * Disable:
   * - info
   * - debug
   * - trace
   *
   * @see {@link https://loglayer.dev/logging-api/basic-logging.html#enabling-disabling-logging | Enabling/Disabling Logging Docs}
   */
  setLevel(logLevel: LogLevelType): This;
  /**
   * Checks if a specific log level is enabled
   *
   * @see {@link https://loglayer.dev/logging-api/basic-logging.html#checking-if-a-log-level-is-enabled | Checking if a Log Level is Enabled Docs}
   */
  isLevelEnabled(logLevel: LogLevelType): boolean;
  /**
   * Enable sending logs to the logging library.
   *
   * @see {@link https://loglayer.dev/logging-api/basic-logging.html#enabling-disabling-logging | Enabling/Disabling Logging Docs}
   */
  enableLogging(): This;
  /**
   * All logging inputs are dropped and stops sending logs to the logging library.
   *
   * @see {@link https://loglayer.dev/logging-api/basic-logging.html#enabling-disabling-logging | Enabling/Disabling Logging Docs}
   */
  disableLogging(): This;

  /**
   * Returns a logger instance for a specific transport
   *
   * @see {@link https://loglayer.dev/logging-api/transport-management.html | Transport Management Docs}
   */
  getLoggerInstance<Library>(id: string): Library | undefined;

  /**
   * Replaces all existing transports with new ones while preserving other logger configuration.
   *
   * Transport changes only affect the current logger instance. Child loggers
   * created before the change will retain their original transports, and
   * parent loggers are not affected when a child modifies its transports.
   *
   * @see {@link https://loglayer.dev/logging-api/transport-management.html | Transport Management Docs}
   */
  withFreshTransports(transports: LogLayerTransport | Array<LogLayerTransport>): This;

  /**
   * Adds one or more transports to the existing transports.
   * If a transport with the same ID already exists, it will be replaced.
   *
   * Transport changes only affect the current logger instance. Child loggers
   * created before the change will retain their original transports, and
   * parent loggers are not affected when a child modifies its transports.
   *
   * @see {@link https://loglayer.dev/logging-api/transport-management.html | Transport Management Docs}
   */
  addTransport(transports: LogLayerTransport | Array<LogLayerTransport>): This;

  /**
   * Removes a transport by its ID.
   *
   * Transport changes only affect the current logger instance. Child loggers
   * created before the change will retain their original transports, and
   * parent loggers are not affected when a child modifies its transports.
   *
   * @returns true if the transport was found and removed, false otherwise.
   *
   * @see {@link https://loglayer.dev/logging-api/transport-management.html | Transport Management Docs}
   */
  removeTransport(id: string): boolean;

  /**
   * Replaces all existing plugins with new ones.
   *
   * When used with child loggers, it only affects the current logger instance
   * and does not modify the parent's plugins.
   *
   * @see {@link https://loglayer.dev/plugins/ | Plugins Docs}
   */
  withFreshPlugins(plugins: Array<LogLayerPlugin>): This;

  /**
   * Sets the context manager to use for managing context data.
   */
  withContextManager(manager: IContextManager): This;

  /**
   * Gets the context manager used by the logger.
   */
  getContextManager<M extends IContextManager = IContextManager>(): M;

  /**
   * Sets the log level manager to use for managing log levels.
   */
  withLogLevelManager(manager: ILogLevelManager): This;

  /**
   * Gets the log level manager used by the logger.
   */
  getLogLevelManager<M extends ILogLevelManager = ILogLevelManager>(): M;

  /**
   * Returns the configuration object used to initialize the logger.
   */
  getConfig(): {
    prefix?: string;
    enabled?: boolean;
    consoleDebug?: boolean;
    transport: LogLayerTransport | Array<LogLayerTransport>;
    plugins?: Array<LogLayerPlugin>;
    errorSerializer?: (err: any) => Record<string, any> | string;
    errorFieldName?: string;
    copyMsgOnOnlyError?: boolean;
    errorFieldInMetadata?: boolean;
    contextFieldName?: string;
    metadataFieldName?: string;
    muteContext?: boolean;
    muteMetadata?: boolean;
  };

  /**
   * Logs a raw log entry with complete control over all log parameters.
   *
   * This method allows you to bypass the normal LogLayer API and directly specify
   * all aspects of a log entry including log level, messages, metadata, and error.
   * It's useful for scenarios where you need to log structured data that doesn't
   * fit the standard LogLayer patterns, or when integrating with external logging
   * systems that provide pre-formatted log entries.
   *
   * The raw entry will still go through all LogLayer processing.
   *
   * @see {@link https://loglayer.dev/logging-api/basic-logging.html | Basic Logging Docs}
   */
  raw(rawEntry: RawLogEntry): void | Promise<void>;
}
