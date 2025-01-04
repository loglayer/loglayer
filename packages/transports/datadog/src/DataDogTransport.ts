import type { LogLayerTransportParams } from "@loglayer/transport";
import type { LoggerlessTransportConfig } from "@loglayer/transport";
import { LoggerlessTransport } from "@loglayer/transport";
import { type DDTransportOptions, DataDogTransport as DatadogTransportCommon } from "datadog-transport-common";

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
}

export class DataDogTransport extends LoggerlessTransport {
  private messageField: string;
  private levelField: string;
  private timestampField: string;
  private timestampFunction?: () => any;
  private transport: DatadogTransportCommon;

  constructor(config: DatadogTransportConfig) {
    super(config);

    this.transport = new DatadogTransportCommon(config.options);
    this.messageField = config.messageField ?? "message";
    this.levelField = config.levelField ?? "level";
    this.timestampField = config.timestampField ?? "time";
    this.timestampFunction = config.timestampFunction;
  }

  shipToLogger({ logLevel, messages, data, hasData }: LogLayerTransportParams) {
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
