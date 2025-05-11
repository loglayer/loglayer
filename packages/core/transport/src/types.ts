import type { LogLevelType } from "@loglayer/shared";

export type { LogLayerTransport, LogLayerTransportParams, LogLevelType } from "@loglayer/shared";
export { LogLevelPriority } from "@loglayer/shared";

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
  level?: LogLevelType;
}

export interface LogLayerTransportConfig<LogLibrary> extends Omit<LoggerlessTransportConfig, "level"> {
  /**
   * The logging library instance to use for logging
   */
  logger: LogLibrary;
}
