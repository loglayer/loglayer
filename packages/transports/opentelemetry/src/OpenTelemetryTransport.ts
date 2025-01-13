import {
  type LogLayerTransportParams,
  LogLevel,
  LoggerlessTransport,
  type LoggerlessTransportConfig,
} from "@loglayer/transport";
import { type Logger, logs } from "@opentelemetry/api-logs";
import { emitLogRecord } from "./utils.js";
import { version } from "./version.js";

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  [LogLevel.trace]: 0,
  [LogLevel.debug]: 1,
  [LogLevel.info]: 2,
  [LogLevel.warn]: 3,
  [LogLevel.error]: 4,
  [LogLevel.fatal]: 5,
};

export interface OpenTelemetryTransportConfig extends LoggerlessTransportConfig {
  /**
   * Callback to handle errors that occur when logging
   */
  onError?: (error: any) => void;
  /**
   * Minimum log level to process. Defaults to "trace"
   */
  level?: LogLevel | "trace" | "debug" | "info" | "warn" | "error" | "fatal";
}

export class OpenTelemetryTransport extends LoggerlessTransport {
  private _logger: Logger;
  private onError?: (error: any) => void;
  private level: LogLevel | "trace" | "debug" | "info" | "warn" | "error" | "fatal";

  constructor(config: OpenTelemetryTransportConfig = {}) {
    super(config);
    this._logger = logs.getLogger("loglayer", version);
    this.onError = config.onError;
    this.level = config.level ?? LogLevel.trace; // Default to trace to allow all logs
  }

  shipToLogger({ logLevel, messages, data, hasData }: LogLayerTransportParams) {
    // Skip if log level is lower priority than configured minimum
    if (LOG_LEVEL_PRIORITY[logLevel] < LOG_LEVEL_PRIORITY[this.level]) {
      return [];
    }

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
