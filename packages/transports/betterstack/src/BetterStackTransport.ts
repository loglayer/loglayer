import type { HttpTransportConfig } from "@loglayer/transport-http";
import { HttpTransport } from "@loglayer/transport-http";

/**
 * Configuration options for the Better Stack transport.
 */
export interface BetterStackTransportConfig extends Omit<HttpTransportConfig, "url" | "headers" | "payloadTemplate"> {
  /**
   * Better Stack source token for authentication
   */
  sourceToken: string;
  /**
   * Better Stack ingestion host
   */
  url: string;
  /**
   * Whether to include timestamp in the log payload
   * @default true
   */
  includeTimestamp?: boolean;
  /**
   * Custom field name for the timestamp
   * @default "dt"
   */
  timestampField?: string;
}

/**
 * Better Stack transport for sending logs to Better Stack's log management platform.
 *
 * This transport extends the HTTP transport and configures it specifically for Better Stack's API.
 * It handles authentication, payload formatting, and batch sending according to Better Stack's requirements.
 *
 * Features:
 * - Automatic authentication with source token
 * - Proper payload formatting for Better Stack API
 * - Support for custom timestamps
 * - Batch sending with configurable size and timeout
 * - Error handling and retry logic
 * - Compression support
 */
export class BetterStackTransport extends HttpTransport {
  /**
   * Creates a new instance of BetterStackTransport.
   *
   * @param config - Configuration options for the transport
   */
  constructor(config: BetterStackTransportConfig) {
    const url = config.url;
    const includeTimestamp = config.includeTimestamp ?? true;
    const timestampField = config.timestampField ?? "dt";

    // Configure the HTTP transport with Better Stack specific settings
    const httpConfig: HttpTransportConfig = {
      ...config,
      url: url,
      headers: {
        Authorization: `Bearer ${config.sourceToken}`,
        "Content-Type": "application/json",
      },
      payloadTemplate: (data) => {
        const payload: Record<string, any> = {
          message: data.message,
        };

        // Add log level if available
        if (data.logLevel) {
          payload.level = data.logLevel;
        }

        // Add metadata if available
        if (data.data) {
          Object.assign(payload, data.data);
        }

        // Add timestamp if enabled
        if (includeTimestamp) {
          payload[timestampField] = new Date().toISOString();
        }

        return JSON.stringify(payload);
      },
      // Better Stack specific defaults
      batchMode: "array",
      batchContentType: "application/json",
      enableBatchSend: config.enableBatchSend ?? true,
      batchSize: config.batchSize ?? 100,
      batchSendTimeout: config.batchSendTimeout ?? 5000,
      compression: config.compression ?? false,
      maxRetries: config.maxRetries ?? 3,
      retryDelay: config.retryDelay ?? 1000,
      respectRateLimit: config.respectRateLimit ?? true,
      maxLogSize: config.maxLogSize ?? 1048576, // 1MB
      maxPayloadSize: config.maxPayloadSize ?? 10485760, // 10MB (Better Stack limit)
    };

    super(httpConfig);
  }
}
