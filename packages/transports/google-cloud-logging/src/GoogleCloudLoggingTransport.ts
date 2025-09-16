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
  rootLevelData?: Omit<
    LogEntry,
    "severity" | "timestamp" | "receiveTimestamp" | "jsonPayload" | "textPayload" | "protoPayload"
  >;

  /**
   * Handling of metadata fields. Defaults to "jsonPayload".
   *
   * "jsonPayload" submits all metadata to `LogEntry.jsonPayload`.
   *
   * "promote" merges metadata with valid `LogEntry` field names into the root level of the `LogEntry`, overwriting fields specified in `rootLevelData`.
   * Metadata that isn't a valid `LogEntry` field is still sent in `LogEntry.jsonPayload`.
   */
  metadataBehavior?: "jsonPayload" | "promote";

  /**
   * Minimum log level to process. Defaults to "trace"
   */
  level?: LogLevelType;
}

type LogEntryField = keyof GoogleCloudLoggingTransport["rootLevelData"];

export class GoogleCloudLoggingTransport extends BaseTransport<Log | LogSync> {
  private rootLevelData: GoogleCloudLoggingTransportConfig["rootLevelData"];
  private metadataBehavior: GoogleCloudLoggingTransportConfig["metadataBehavior"];
  private level: LogLevelType;

  private logEntryKeys: Set<LogEntryField> = new Set([
    "logName",
    "resource",
    "insertId",
    "httpRequest",
    "labels",
    "operation",
    "trace",
    "spanId",
    "traceSampled",
    "sourceLocation",
    "split",
  ]);

  constructor(config: GoogleCloudLoggingTransportConfig) {
    super(config);
    this.rootLevelData = config.rootLevelData || {};
    this.metadataBehavior = config.metadataBehavior ?? "jsonPayload";
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

  private extractLogEntryFields(data: Record<string, unknown>) {
    const keys = Object.keys(data);
    const metadata: Record<string, unknown> = {};

    for (const key of keys) {
      if (this.logEntryKeys.has(key as LogEntryField)) {
        metadata[key] = data[key];
        delete data[key];
      }
    }

    return metadata;
  }

  shipToLogger({ data, hasData, logLevel, messages }: LogLayerTransportParams): any[] {
    // Skip if log level is lower priority than configured minimum
    if (LogLevelPriority[logLevel] < LogLevelPriority[this.level]) {
      return [];
    }

    const safeData = data && hasData ? data : {};
    const metadata = this.metadataBehavior === "promote" ? this.extractLogEntryFields(safeData) : {};

    const entry = this.logger.entry(
      {
        ...this.rootLevelData,
        ...metadata,
        severity: this.mapLogLevel(logLevel),
        timestamp: new Date(),
      },
      {
        ...safeData,
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
