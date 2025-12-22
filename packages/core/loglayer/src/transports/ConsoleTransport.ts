import { LogLevel, type LogLevelType } from "@loglayer/shared";
import type { LogLayerTransportConfig, LogLayerTransportParams } from "@loglayer/transport";
import { BaseTransport, LogLevelPriority } from "@loglayer/transport";

type ConsoleType = typeof console;

/**
 * Configuration options for the ConsoleTransport.
 */
interface ConsoleTransportConfig extends LogLayerTransportConfig<ConsoleType> {
  /**
   * If true, object data will be appended as the last parameter.
   * If false, object data will be prepended as the first parameter (default).
   * Has no effect if messageField is defined.
   */
  appendObjectData?: boolean;
  /**
   * Minimum log level to process. Defaults to "trace".
   */
  level?: LogLevel | "trace" | "debug" | "info" | "warn" | "error" | "fatal";
  /**
   * If defined,
   * - will place the message into the specified field in the log object.
   * - Multi-parameter messages will be joined with a space. Use the sprintf plugin to format messages.
   * - Only the log object will be logged to the console when this is defined.
   */
  messageField?: string;
  /**
   * If defined, populates the field with the ISO date.
   * If dateFn is defined, will call dateFn to derive the date.
   */
  dateField?: string;
  /**
   * If defined, populates the field with the log level.
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
   * If true, applies JSON.stringify to the structured log output when messageField, dateField, or levelField is defined.
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
 * Transport for use with a console logger.
 */
export class ConsoleTransport extends BaseTransport<ConsoleType> {
  private appendObjectData: boolean;
  private logLevel: LogLevel | "trace" | "debug" | "info" | "warn" | "error" | "fatal";
  private messageField?: string;
  private dateField?: string;
  private levelField?: string;
  private dateFn?: () => string | number;
  private levelFn?: (logLevel: LogLevelType) => string | number;
  private stringify: boolean;
  private messageFn?: (params: LogLayerTransportParams) => string;

  constructor(params: ConsoleTransportConfig) {
    super(params);
    this.appendObjectData = params.appendObjectData || false;
    this.logLevel = params.level ?? "trace";
    this.messageField = params.messageField;
    this.dateField = params.dateField;
    this.levelField = params.levelField;
    this.dateFn = params.dateFn;
    this.levelFn = params.levelFn;
    this.stringify = params.stringify || false;
    this.messageFn = params.messageFn;
  }

  shipToLogger(params: LogLayerTransportParams) {
    const { logLevel, data, hasData } = params;
    let { messages } = params;

    // Skip if log level is lower priority than configured minimum
    if (LogLevelPriority[logLevel] < LogLevelPriority[this.logLevel]) {
      return;
    }

    // Apply messageFn if defined to format the message
    if (this.messageFn) {
      messages = [this.messageFn(params)];
    }

    if (this.messageField) {
      // Join messages with a space if messageField is defined
      const messageText = messages.join(" ");
      const logObject = {
        ...(data || {}),
        [this.messageField]: messageText,
        ...(this.dateField && { [this.dateField]: this.dateFn ? this.dateFn() : new Date().toISOString() }),
        ...(this.levelField && { [this.levelField]: this.levelFn ? this.levelFn(logLevel) : logLevel }),
      };
      messages = [this.stringify ? JSON.stringify(logObject) : logObject];
    } else if (this.dateField || this.levelField) {
      // Only dateField or levelField are defined - preserve original messages and add fields as additional parameter
      const logObject = {
        ...(data || {}),
        ...(this.dateField && { [this.dateField]: this.dateFn ? this.dateFn() : new Date().toISOString() }),
        ...(this.levelField && { [this.levelField]: this.levelFn ? this.levelFn(logLevel) : logLevel }),
      };
      if (this.stringify) {
        messages.push(JSON.stringify(logObject));
      } else {
        messages.push(logObject);
      }
    } else if (data && hasData) {
      if (this.appendObjectData) {
        messages.push(data);
      } else {
        messages.unshift(data);
      }
    }

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
