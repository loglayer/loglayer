import type { LoggerlessTransportConfig, LogLayerTransportParams, LogLevelType } from "@loglayer/transport";
import { LoggerlessTransport, type LogLevel, LogLevelPriority } from "@loglayer/transport";
import { DataDogTransport as DatadogTransportCommon, type DDTransportOptions } from "datadog-transport-common";

export interface DatadogTransportConfig extends LoggerlessTransportConfig {
  /**
   * The options to pass to the datadog-transport-common instance.
   */
  options: DDTransportOptions;
  /**
   * The field name to use for the message. Default is "message".
   */
  messageField?: string;
  /**
   * The field name to use for the log level. Default is "level".
   */
  levelField?: string;
  /**
   * The field name to use for the timestamp. Default is "time".
   */
  timestampField?: string;
  /**
   * A custom function to stamp the timestamp
   */
  timestampFunction?: () => any;
  /**
   * Minimum log level to send to DataDog. Logs below this level will be filtered out.
   * For example, if set to "warn", only warn, error, and fatal logs will be sent.
   */
  level?: LogLevelType;
}

export class DataDogTransport extends LoggerlessTransport {
  private messageField: string;
  private levelField: string;
  private timestampField: string;
  private timestampFunction?: () => any;
  private transport: DatadogTransportCommon;
  private minLevelPriority?: number;

  constructor(config: DatadogTransportConfig) {
    super(config);

    if (!this.enabled) {
      return;
    }

    this.transport = new DatadogTransportCommon(config.options);
    this.messageField = config.messageField ?? "message";
    this.levelField = config.levelField ?? "level";
    this.timestampField = config.timestampField ?? "time";
    this.timestampFunction = config.timestampFunction;

    if (config.level) {
      this.minLevelPriority = LogLevelPriority[config.level as LogLevel];
    }
  }

  shipToLogger({ logLevel, messages, data, hasData }: LogLayerTransportParams) {
    if (!this.transport) {
      throw new Error(
        "DataDogTransport was previously disabled; enabling the flag manually on the transport instance is not supported.",
      );
    }

    // Filter out logs below the minimum level
    if (this.minLevelPriority !== undefined) {
      const currentLevelPriority = LogLevelPriority[logLevel as LogLevel];
      if (currentLevelPriority < this.minLevelPriority) {
        return messages;
      }
    }

    const logEntry: Record<string, any> = {};

    if (data && hasData) {
      Object.assign(logEntry, data);
    }

    if (this.timestampFunction) {
      logEntry[this.timestampField] = this.timestampFunction();
    } else {
      logEntry[this.timestampField] = new Date().toISOString();
    }

    logEntry[this.levelField] = logLevel;
    logEntry[this.messageField] = messages.join(" ");

    this.transport.processLog(logEntry);

    return messages;
  }
}
