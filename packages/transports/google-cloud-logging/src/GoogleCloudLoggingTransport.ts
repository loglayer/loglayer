import type { Log, LogSync } from "@google-cloud/logging";
import type { LogEntry } from "@google-cloud/logging/build/src/entry.js";
import type { LogLayerTransportConfig, LogLayerTransportParams } from "@loglayer/transport";
import { BaseTransport, LogLevel, type LogLevelType } from "@loglayer/transport";

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
   * List of LogLayer metadata fields to merge into `rootLevelData` when creating the log entry.
   */
  rootLevelMetadataFields?: Array<string>;
}

export class GoogleCloudLoggingTransport extends BaseTransport<Log | LogSync> {
  private rootLevelData: GoogleCloudLoggingTransportConfig["rootLevelData"];
  private rootLevelMetadataFields: Array<string>;

  constructor(config: GoogleCloudLoggingTransportConfig) {
    super(config);
    this.rootLevelData = config.rootLevelData || {};
    this.rootLevelMetadataFields = config.rootLevelMetadataFields ?? [];
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
      if (this.rootLevelMetadataFields.includes(key)) {
        metadata[key] = data[key];
        delete data[key];
      }
    }

    return metadata;
  }

  shipToLogger({ data, hasData, logLevel, messages }: LogLayerTransportParams): any[] {
    const safeData = data && hasData ? data : {};
    const metadata = this.extractLogEntryFields(safeData);

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
