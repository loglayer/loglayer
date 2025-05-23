import { LogLevel } from "@loglayer/shared";
import type { LogLayerTransportConfig, LogLayerTransportParams } from "@loglayer/transport";
import { BaseTransport } from "@loglayer/transport";
import { LogLevelPriority } from "@loglayer/transport";

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
}

/**
 * Transport for use with a console logger.
 */
export class ConsoleTransport extends BaseTransport<ConsoleType> {
  private appendObjectData: boolean;
  private logLevel: LogLevel | "trace" | "debug" | "info" | "warn" | "error" | "fatal";
  private messageField?: string;

  constructor(params: ConsoleTransportConfig) {
    super(params);
    this.appendObjectData = params.appendObjectData || false;
    this.logLevel = params.level ?? "trace";
    this.messageField = params.messageField;
  }

  shipToLogger({ logLevel, messages, data, hasData }: LogLayerTransportParams) {
    // Skip if log level is lower priority than configured minimum
    if (LogLevelPriority[logLevel] < LogLevelPriority[this.logLevel]) {
      return;
    }

    if (this.messageField) {
      // Join messages with a space if messageField is defined
      const messageText = messages.join(" ");
      const logObject = {
        ...(data || {}),
        [this.messageField]: messageText,
      };
      messages = [logObject];
    } else if (data && hasData) {
      if (this.appendObjectData) {
        messages.push(data);
      } else {
        messages.unshift(data);
      }
    }

    switch (logLevel) {
      case LogLevel.info:
        // @ts-ignore
        this.logger.info(...messages);
        break;
      case LogLevel.warn:
        // @ts-ignore
        this.logger.warn(...messages);
        break;
      case LogLevel.error:
        // @ts-ignore
        this.logger.error(...messages);
        break;
      case LogLevel.trace:
        // @ts-ignore
        this.logger.trace(...messages);
        break;
      case LogLevel.debug:
        // @ts-ignore
        this.logger.debug(...messages);
        break;
      case LogLevel.fatal:
        // @ts-ignore
        this.logger.error(...messages);
        break;
    }

    return messages;
  }
}
