import { BaseTransport, type LogLayerTransportParams } from "@loglayer/transport";
import type { LogLayerTransportConfig } from "@loglayer/transport";
import { type DDTransportOptions, DataDogTransport as DatadogTransportCommon } from "datadog-transport-common";

export interface DatadogTransportConfig extends Omit<LogLayerTransportConfig<DatadogTransportCommon>, "logger"> {
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

class DataDogTransport extends BaseTransport<DatadogTransportCommon> {
  messageField: string;
  levelField: string;
  timestampField: string;
  timestampFunction?: () => any;

  constructor(config: DatadogTransportConfig & Pick<LogLayerTransportConfig<DatadogTransportCommon>, "logger">) {
    super(config);

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

    if (this.timestampField && this.timestampFunction) {
      logEntry[this.timestampField] = this.timestampFunction();
    } else {
      logEntry[this.timestampField] = new Date().toISOString();
    }

    logEntry[this.levelField] = logLevel;
    logEntry[this.messageField] = messages.join(" ");

    this.logger.processLog(logEntry);

    return messages;
  }
}

export function createDataDogTransport(config: DatadogTransportConfig) {
  return new DataDogTransport({
    ...config,
    logger: new DatadogTransportCommon(config.options),
  });
}
