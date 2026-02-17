/**
 * LogLayer transport for sending logs to the Central log aggregation server.
 * @module
 */

import { LogLevel, LogLevelPriority } from "@loglayer/transport";
import { HttpTransport, type HttpTransportConfig } from "@loglayer/transport-http";

/** Default port for the Central log aggregation server */
export const DEFAULT_PORT = 9800;

/** Default base URL for the Central log aggregation server */
export const DEFAULT_BASE_URL = `http://localhost:${DEFAULT_PORT}`;

/**
 * Configuration options for the Central transport.
 * All HttpTransport options (batching, retries, compression, etc.) are supported
 * via the `httpOptions` field.
 */
export interface LogLayerCentralTransportConfig
  extends Omit<HttpTransportConfig, "url" | "payloadTemplate" | "batchMode"> {
  /**
   * The base URL of the Central log aggregation server.
   * @default "http://localhost:9800"
   */
  baseUrl?: string;

  /**
   * The service name to attach to all logs.
   * This identifies the source application in the Central server.
   */
  service: string;

  /**
   * Optional instance ID to differentiate between multiple instances
   * of the same service.
   */
  instanceId?: string;

  /**
   * Static tags to attach to all logs sent through this transport.
   * Tags are key:value strings (e.g., [\"env:prod\", \"region:us-east\"]).
   */
  tags?: string[];
}

/** Extracts metadata from the data object (everything except context, err, and error keys). */
function extractMetadata(data: Record<string, unknown>): Record<string, unknown> | undefined {
  const { context, err, error, ...metadata } = data;
  return Object.keys(metadata).length > 0 ? metadata : undefined;
}

/** Extracts the context object from the data object. */
function extractContext(data: Record<string, unknown>): Record<string, unknown> | undefined {
  const context = data.context;
  if (context && typeof context === "object" && !Array.isArray(context)) {
    return context as Record<string, unknown>;
  }
  return undefined;
}

/**
 * LogLayer transport that sends logs to the Central log aggregation server.
 * Extends HttpTransport so batching, retries, compression, and rate-limiting
 * work out of the box.
 *
 * @example
 * ```typescript
 * import { LogLayer } from "loglayer";
 * import { LogLayerCentralTransport } from "@loglayer/transport-central";
 *
 * const log = new LogLayer({
 *   transport: new LogLayerCentralTransport({
 *     baseUrl: "http://localhost:9800",
 *     service: "my-app",
 *     instanceId: "instance-1",
 *   }),
 * });
 *
 * log.info("Application started");
 * log.withMetadata({ userId: 123 }).error("User not found");
 * ```
 */
export class LogLayerCentralTransport extends HttpTransport {
  constructor(config: LogLayerCentralTransportConfig) {
    const { baseUrl, service, instanceId, tags, ...httpOptions } = config;

    super({
      ...httpOptions,
      url: `${baseUrl ?? DEFAULT_BASE_URL}/api/logs`,
      // Central's POST /api/logs accepts both a single object and a JSON array.
      batchMode: "array",
      payloadTemplate: ({ logLevel, message, data, hasData, error, groups }) => {
        return JSON.stringify({
          service,
          message,
          level: logLevel in LogLevelPriority ? logLevel : LogLevel.info,
          timestamp: new Date().toISOString(),
          instanceId,
          metadata: hasData && data ? extractMetadata(data) : undefined,
          context: hasData && data ? extractContext(data) : undefined,
          error: error ? { name: error.name, message: error.message, stack: error.stack } : undefined,
          groups: groups && groups.length > 0 ? groups : undefined,
          tags: tags && tags.length > 0 ? tags : undefined,
        });
      },
    });
  }
}
