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

  /**
   * Callback to handle errors that occur when creating or writing log entries.
   *
   * Errors are caught by the transport (so logging failures never surface as
   * unhandled rejections or crash the application) and reported here. If `onError`
   * is not provided, errors are silently ignored.
   *
   * If the Google Cloud Logging client was created with a `defaultWriteDeleteCallback`,
   * API-level write failures are reported to that callback instead of rejecting the
   * `write()` promise. `onError` still receives failures that occur before the SDK
   * invokes that callback (for example, project or resource detection failures),
   * so the two are complementary.
   */
  onError?: (error: Error) => void;
}

export class GoogleCloudLoggingTransport extends BaseTransport<Log | LogSync> {
  private rootLevelData: GoogleCloudLoggingTransportConfig["rootLevelData"];
  private rootLevelMetadataFields: Array<string>;
  private onError?: (error: Error) => void;

  constructor(config: GoogleCloudLoggingTransportConfig) {
    super(config);
    this.rootLevelData = config.rootLevelData || {};
    this.rootLevelMetadataFields = config.rootLevelMetadataFields ?? [];
    this.onError = config.onError;
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

  private handleError(error: unknown) {
    if (!this.onError) {
      return;
    }

    try {
      this.onError(error instanceof Error ? error : new Error(String(error)));
    } catch {
      // A throwing onError callback must never escape the transport
    }
  }

  shipToLogger({ data, hasData, logLevel, messages }: LogLayerTransportParams): any[] {
    const safeData = data && hasData ? data : {};

    try {
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

      // `Log.write()` returns a Promise that can reject for failures that happen before the
      // SDK's `defaultWriteDeleteCallback` is invoked (eg, project/resource detection).
      // `LogSync.write()` returns void. Handle both shapes so logging failures never surface
      // as unhandled rejections.
      const writeResult = this.logger.write(entry) as PromiseLike<unknown> | undefined;

      if (writeResult && typeof writeResult.then === "function") {
        writeResult.then(undefined, (error: unknown) => {
          this.handleError(error);
        });
      }
    } catch (error) {
      this.handleError(error);
    }

    if (data && hasData) {
      return [data, messages];
    }

    return [messages];
  }
}
