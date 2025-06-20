import { LoggerlessTransport, type LoggerlessTransportConfig, type LogLayerTransportParams } from "@loglayer/transport";
import { type Logger, logs } from "@opentelemetry/api-logs";
import { emitLogRecord } from "./utils.js";

export interface OpenTelemetryTransportConfig extends LoggerlessTransportConfig {
  /**
   * Callback to handle errors that occur when logging
   */
  onError?: (error: any) => void;
}

export class OpenTelemetryTransport extends LoggerlessTransport {
  private _logger: Logger;
  private onError?: (error: any) => void;

  constructor(config: OpenTelemetryTransportConfig = {}) {
    super(config);
    this._logger = logs.getLogger("loglayer");
    this.onError = config.onError;
  }

  shipToLogger({ logLevel, messages, data, hasData }: LogLayerTransportParams) {
    const assembled = {
      level: logLevel,
      message: messages.join(" "),
      ...(hasData ? data : {}),
    };

    try {
      emitLogRecord(assembled, this._logger);
    } catch (error: any) {
      if (this.onError) {
        this.onError(error);
      }
    }

    return [assembled];
  }
}
