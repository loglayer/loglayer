import type { HttpTransportConfig } from "@loglayer/transport-http";
import { HttpTransport } from "@loglayer/transport-http";

/**
 * Configuration options for the Logflare transport.
 * This is essentially a wrapper around HttpTransport with Logflare specific defaults.
 */
export interface LogflareTransportConfig extends Omit<HttpTransportConfig, "url" | "headers" | "payloadTemplate"> {
  /**
   * Your Logflare source ID
   */
  sourceId: string;
  /**
   * Your Logflare API key
   */
  apiKey: string;
  /**
   * Custom Logflare API endpoint (for self-hosted instances)
   * @default "https://api.logflare.app"
   */
  url?: string;
  /**
   * Function to transform log data into the payload format (optional, defaults to Logflare format)
   */
  payloadTemplate?: (data: { logLevel: string; message: string; data?: Record<string, any> }) => string;
}

/**
 * LogflareTransport is responsible for sending logs to Logflare.
 * It extends HttpTransport with Logflare-specific configuration.
 *
 * Features:
 * - Automatic Logflare JSON format
 * - Retry logic with exponential backoff (via HttpTransport)
 * - Rate limiting support (via HttpTransport)
 * - Batch sending with configurable size and timeout (via HttpTransport)
 * - Error and debug callbacks
 * - Support for self-hosted Logflare instances
 */
export class LogflareTransport extends HttpTransport {
  constructor(config: LogflareTransportConfig) {
    const apiEndpoint = config.url ?? "https://api.logflare.app";
    const fullUrl = `${apiEndpoint}/logs/json?source=${config.sourceId}`;

    const payloadTemplate =
      config.payloadTemplate ??
      (({ logLevel, message, data }) => {
        const logEntry: Record<string, any> = {
          message,
        };

        // Only add metadata if data is provided
        if (data) {
          logEntry.metadata = data;
        }

        return JSON.stringify(logEntry);
      });

    // Create HTTP transport config, excluding Logflare-specific properties
    const httpConfig = { ...config };
    delete httpConfig.sourceId;
    delete httpConfig.apiKey;
    delete httpConfig.url;
    delete httpConfig.payloadTemplate;

    super({
      url: fullUrl,
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "X-API-KEY": config.apiKey,
      },
      payloadTemplate,
      batchMode: "field", // Use Logflare's batch format
      batchFieldName: "batch", // Use Logflare's batch field name
      ...httpConfig,
    });
  }
}
