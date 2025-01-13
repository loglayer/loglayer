import { LogLevel } from "@loglayer/shared";
import {
  type LogLayerTransport,
  type LogLayerTransportParams,
  LogLevelPriority,
  type LoggerlessTransportConfig,
} from "./types.js";

/**
 * For implementing libraries that aren't logging libraries
 */
export abstract class LoggerlessTransport implements LogLayerTransport {
  /**
   * An identifier for the transport. If not defined, a random one will be generated.
   */
  id?: string;

  /**
   * If false, the transport will not send logs to the logger.
   */
  enabled: boolean;

  /**
   * Minimum log level to process. Defaults to "trace".
   */
  level?: LogLevel | "trace" | "debug" | "info" | "warn" | "error" | "fatal";

  /**
   * If true, the transport will log to the console for debugging purposes
   */
  protected consoleDebug?: boolean;

  constructor(config: LoggerlessTransportConfig) {
    // loglayer still needs an id, so we generate one even if it won't really be used
    this.id = new Date().getTime().toString() + Math.random().toString();
    this.enabled = config.enabled ?? true;
    this.consoleDebug = config.consoleDebug ?? false;
    this.level = config.level ?? "trace";
  }

  /**
   * LogLayer calls this to send logs to the transport
   */
  _sendToLogger(params: LogLayerTransportParams): void {
    if (!this.enabled) {
      return;
    }

    // Skip if log level is lower priority than configured minimum
    if (LogLevelPriority[params.logLevel] < LogLevelPriority[this.level]) {
      return;
    }

    const messages = this.shipToLogger(params);

    if (this.consoleDebug) {
      switch (params.logLevel) {
        case LogLevel.info:
          console.info(...messages);
          break;
        case LogLevel.warn:
          console.warn(...messages);
          break;
        case LogLevel.error:
          console.error(...messages);
          break;
        case LogLevel.trace:
          console.debug(...messages);
          break;
        case LogLevel.debug:
          console.debug(...messages);
          break;
        case LogLevel.fatal:
          console.debug(...messages);
          break;
        default:
          console.log(...messages);
      }
    }
  }

  /**
   * Returns the logger instance attached to the transport
   */
  getLoggerInstance() {
    throw new Error("This transport does not have a logger instance");
  }

  /**
   * Sends the log data to the logger for transport
   */
  abstract shipToLogger(params: LogLayerTransportParams): any[];
}
