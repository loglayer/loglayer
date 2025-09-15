import type { Log, LogSync } from "@google-cloud/logging";
import type { LogEntry } from "@google-cloud/logging/build/src/entry.js";
import type { LogLayerTransportConfig, LogLayerTransportParams } from "@loglayer/transport";
import { BaseTransport, LogLevel, LogLevelPriority, type LogLevelType } from "@loglayer/transport";

export interface GoogleCloudLoggingTransportConfig extends LogLayerTransportConfig<Log | LogSync> {
  /**
   * The root level data to include for all log entries.
   * "severity", "timestamp" and "jsonPayload" are already populated by the transport.
   * @see https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry
   */
  rootLevelData?: Omit<LogEntry, "severity" | "timestamp" | "jsonPayload">;

  /**
   * Minimum log level to process. Defaults to "trace"
   */
  level?: LogLevelType;
}

export class GoogleCloudLoggingTransport extends BaseTransport<Log | LogSync> {
  private rootLevelData: Omit<LogEntry, "severity" | "timestamp" | "jsonPayload">;
  private level: LogLevelType;

  constructor(config: GoogleCloudLoggingTransportConfig) {
    super(config);
    this.rootLevelData = config.rootLevelData || {};
    this.level = config.level ?? LogLevel.trace; // Default to trace to allow all logs
  }

  private mapLogLevel(level: LogLevelType): string {
    switch (level) {
      case LogLevel.fatal:
        return "CRITICAL";
      case LogLevel.error:
        return "ERROR";
      case LogLevel.warn:
        return "WARNING";
      case LogLevel.info:
        return "INFO";
      case LogLevel.debug:
        return "DEBUG";
      case LogLevel.trace:
        return "DEBUG";
      default:
        return "DEFAULT";
    }
  }

  shipToLogger({ data, hasData, logLevel, messages }: LogLayerTransportParams): any[] {
    // Skip if log level is lower priority than configured minimum
    if (LogLevelPriority[logLevel] < LogLevelPriority[this.level]) {
      return [];
    }

    const entry = this.logger.entry(
      {
        ...this.rootLevelData,
        severity: this.mapLogLevel(logLevel),
        timestamp: new Date(),
      },
      {
        ...(data && hasData ? data : {}),
        message: messages.join(" "),
      },
    );

    this.logger.write(entry);

    if (data && hasData) {
      return [data, messages];
    }

    return [messages];
  }
}
