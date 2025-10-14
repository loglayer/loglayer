import type { LogLayerTransportConfig, LogLayerTransportParams } from "@loglayer/transport";
import { BaseTransport } from "@loglayer/transport";

/**
 * Sentry logger interface
 */
export interface SentryLogger {
  trace: (...args: any[]) => void;
  debug: (...args: any[]) => void;
  info: (...args: any[]) => void;
  warn: (...args: any[]) => void;
  error: (...args: any[]) => void;
  fatal: (...args: any[]) => void;
}

/**
 * Configuration options for the Sentry transport.
 */
export interface SentryTransportConfig extends LogLayerTransportConfig<SentryLogger> {
  // No additional configuration needed beyond the base transport config
}

/**
 * SentryTransport is responsible for sending logs to Sentry using the Sentry SDK.
 * It uses the Sentry logger API to send structured logs to Sentry.
 *
 * Features:
 * - Uses Sentry logger for structured logging
 * - Supports all Sentry log levels (trace, debug, info, warn, error, fatal)
 * - Automatic error and debug callbacks
 * - Integrates with Sentry's structured logging features
 */
export class SentryTransport extends BaseTransport<SentryLogger> {
  /**
   * Processes and ships log entries to Sentry using the Sentry logger.
   *
   * @param params - Log parameters including level, messages, and metadata
   * @returns The original messages array
   */
  shipToLogger({ logLevel, messages, data, hasData }: LogLayerTransportParams): any[] {
    // Create a new array with joined message and optional data
    const args = [messages.join(" ")];

    if (data && hasData) {
      // Add data object as a separate parameter
      // @ts-expect-error
      args.push(data);
    }

    // Map LogLayer log levels to Sentry logger methods
    switch (logLevel) {
      case "trace":
        this.logger.trace(...args);
        break;
      case "debug":
        this.logger.debug(...args);
        break;
      case "info":
        this.logger.info(...args);
        break;
      case "warn":
        this.logger.warn(...args);
        break;
      case "error":
        this.logger.error(...args);
        break;
      case "fatal":
        this.logger.fatal(...args);
        break;
      default:
        // Fallback to info level for unknown log levels
        this.logger.info(...args);
    }

    return messages;
  }
}
