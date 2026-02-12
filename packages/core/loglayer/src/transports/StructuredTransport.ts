import { LogLevel, type LogLevelType } from "@loglayer/shared";
import type { LogLayerTransportConfig, LogLayerTransportParams } from "@loglayer/transport";
import { BaseTransport, LogLevelPriority } from "@loglayer/transport";

type ConsoleType = typeof console;

/**
 * Configuration options for the StructuredTransport.
 */
interface StructuredTransportConfig extends LogLayerTransportConfig<ConsoleType> {
  /**
   * Minimum log level to process. Defaults to "trace".
   */
  level?: LogLevel | "trace" | "debug" | "info" | "warn" | "error" | "fatal";
  /**
   * The field name for the log message. Defaults to "msg".
   * Multi-parameter messages will be joined with a space.
   */
  messageField?: string;
  /**
   * The field name for the timestamp. Defaults to "time".
   * If dateFn is defined, will call dateFn to derive the date.
   */
  dateField?: string;
  /**
   * The field name for the log level. Defaults to "level".
   * If levelFn is defined, will call levelFn to derive the level.
   */
  levelField?: string;
  /**
   * If defined, a function that returns a string or number for the value to be used for the dateField.
   */
  dateFn?: () => string | number;
  /**
   * If defined, a function that returns a string or number for a given log level.
   * The input should be the logLevel.
   */
  levelFn?: (logLevel: LogLevelType) => string | number;
  /**
   * If true, applies JSON.stringify to the structured log output.
   * Defaults to false.
   */
  stringify?: boolean;
  /**
   * Custom function to format the log message output.
   * Receives log level, messages, and data; returns the formatted string.
   */
  messageFn?: (params: LogLayerTransportParams) => string;
}

/**
 * A console transport with structured logging enabled by default.
 * Outputs logs as objects with `msg`, `level`, and `time` fields.
 */
export class StructuredTransport extends BaseTransport<ConsoleType> {
  private logLevel: LogLevel | "trace" | "debug" | "info" | "warn" | "error" | "fatal";
  private messageField: string;
  private dateField: string;
  private levelField: string;
  private dateFn?: () => string | number;
  private levelFn?: (logLevel: LogLevelType) => string | number;
  private stringify: boolean;
  private messageFn?: (params: LogLayerTransportParams) => string;

  constructor(params: StructuredTransportConfig) {
    super(params);
    this.logLevel = params.level ?? "trace";
    this.messageField = params.messageField ?? "msg";
    this.dateField = params.dateField ?? "time";
    this.levelField = params.levelField ?? "level";
    this.dateFn = params.dateFn;
    this.levelFn = params.levelFn;
    this.stringify = params.stringify || false;
    this.messageFn = params.messageFn;
  }

  shipToLogger(params: LogLayerTransportParams) {
    const { logLevel, data } = params;
    let { messages } = params;

    // Skip if log level is lower priority than configured minimum
    if (LogLevelPriority[logLevel] < LogLevelPriority[this.logLevel]) {
      return;
    }

    // Apply messageFn if defined to format the message
    if (this.messageFn) {
      messages = [this.messageFn(params)];
    }

    // Join messages with a space and build structured log object
    const messageText = messages.join(" ");
    const logObject = {
      [this.levelField]: this.levelFn ? this.levelFn(logLevel) : logLevel,
      [this.dateField]: this.dateFn ? this.dateFn() : new Date().toISOString(),
      [this.messageField]: messageText,
      ...(data || {}),
    };
    messages = [this.stringify ? JSON.stringify(logObject) : logObject];

    switch (logLevel) {
      case LogLevel.info:
        this.logger.info(...messages);
        break;
      case LogLevel.warn:
        this.logger.warn(...messages);
        break;
      case LogLevel.error:
        this.logger.error(...messages);
        break;
      case LogLevel.trace:
        this.logger.trace(...messages);
        break;
      case LogLevel.debug:
        this.logger.debug(...messages);
        break;
      case LogLevel.fatal:
        this.logger.error(...messages);
        break;
    }

    return messages;
  }
}
