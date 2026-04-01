import type { HttpTransportConfig } from "@loglayer/transport-http";
import { HttpTransport } from "@loglayer/transport-http";

/**
 * Configuration options for the Cribl transport.
 * Sends logs to Cribl Stream via the HTTP/S Bulk API source.
 */
export interface CriblTransportConfig extends Omit<HttpTransportConfig, "url" | "headers" | "payloadTemplate"> {
  /**
   * The Cribl Stream instance URL (e.g., "https://cribl.example.com:10080")
   * Default port is 10080 for the HTTP/S source.
   */
  url: string;
  /**
   * The auth token configured in the Cribl HTTP source.
   * Sent as `Authorization: <token>` header.
   */
  token?: string;
  /**
   * Optional source value for events
   */
  source?: string;
  /**
   * Optional host value for events
   */
  host?: string;
  /**
   * The field name used for the log message in the event payload.
   * @default "_raw"
   */
  messageField?: string;
  /**
   * The field name used for the timestamp in the event payload.
   * @default "_time"
   */
  timeField?: string;
  /**
   * The base path for the Cribl HTTP event API.
   * @default "/cribl"
   */
  basePath?: string;
  /**
   * Custom headers to include in requests (merged with default headers)
   */
  headers?: Record<string, string>;
  /**
   * Function to transform log data into the payload format.
   * Defaults to Cribl HTTP Bulk API JSON format with `_raw`, `_time`, `host`, and `source` fields.
   */
  payloadTemplate?: (data: { logLevel: string; message: string; data?: Record<string, any> }) => string;
}

/**
 * CriblTransport sends logs to Cribl Stream via the HTTP/S Bulk API source.
 * It extends HttpTransport with Cribl-specific configuration.
 *
 * Uses the Cribl HTTP event API endpoint (`/cribl/_bulk`) which accepts
 * newline-delimited JSON events.
 *
 * Features:
 * - Automatic Cribl HTTP Bulk API JSON format
 * - Built on top of the robust HTTP transport
 * - Retry logic with exponential backoff (via HttpTransport)
 * - Rate limiting support (via HttpTransport)
 * - Batch sending with configurable size and timeout (via HttpTransport)
 * - Error and debug callbacks
 */
export class CriblTransport extends HttpTransport {
  constructor(config: CriblTransportConfig) {
    const basePath = config.basePath ?? "/cribl";
    const fullUrl = `${config.url.replace(/\/$/, "")}${basePath}/_bulk`;

    const { source, host } = config;
    const messageField = config.messageField ?? "_raw";
    const timeField = config.timeField ?? "_time";

    const payloadTemplate =
      config.payloadTemplate ??
      (({ logLevel, message, data }) => {
        const event: Record<string, any> = {
          [timeField]: Math.floor(Date.now() / 1000),
          [messageField]: message,
          level: logLevel,
        };

        if (source) event.source = source;
        if (host) event.host = host;

        if (data) {
          Object.assign(event, data);
        }

        return JSON.stringify(event);
      });

    const defaultHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (config.token) {
      defaultHeaders.Authorization = config.token;
    }

    const mergedHeaders = config.headers ? { ...defaultHeaders, ...config.headers } : defaultHeaders;

    // Create HTTP transport config, excluding Cribl-specific properties
    const httpConfig = { ...config };
    delete httpConfig.url;
    delete httpConfig.token;
    delete httpConfig.source;
    delete httpConfig.host;
    delete httpConfig.messageField;
    delete httpConfig.timeField;
    delete httpConfig.basePath;
    delete httpConfig.headers;
    delete httpConfig.payloadTemplate;

    super({
      url: fullUrl,
      method: "POST",
      headers: mergedHeaders,
      payloadTemplate,
      ...httpConfig,
    });
  }
}
