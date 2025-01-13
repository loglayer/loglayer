import { LogLevel } from "@loglayer/shared";

export const LogLevelPriority: Record<LogLevel, number> = {
  [LogLevel.trace]: 0,
  [LogLevel.debug]: 1,
  [LogLevel.info]: 2,
  [LogLevel.warn]: 3,
  [LogLevel.error]: 4,
  [LogLevel.fatal]: 5,
};

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

export interface LoggerlessTransportConfig {
  /**
   * A user-defined identifier for the transport
   */
  id?: string;
  /**
   * If false, the transport will not send logs to the logger.
   * Default is true.
   */
  enabled?: boolean;
  /**
   * If true, the transport will log to the console for debugging purposes
   */
  consoleDebug?: boolean;
  /**
   * Minimum log level to process. Defaults to "trace".
   */
  level?: "trace" | "debug" | "info" | "warn" | "error" | "fatal";
}

export interface LogLayerTransportConfig<LogLibrary> extends Omit<LoggerlessTransportConfig, "level"> {
  /**
   * The logging library instance to use for logging
   */
  logger: LogLibrary;
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
