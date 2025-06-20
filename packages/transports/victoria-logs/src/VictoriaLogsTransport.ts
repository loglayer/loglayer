import type { HttpTransportConfig } from "@loglayer/transport-http";
import { HttpTransport } from "@loglayer/transport-http";

/**
 * Configuration options for the VictoriaLogs transport.
 * This is essentially a wrapper around HttpTransport with VictoriaLogs specific defaults.
 */
export interface VictoriaLogsTransportConfig extends Omit<HttpTransportConfig, "url" | "payloadTemplate"> {
  /**
   * The VictoriaLogs host URL (e.g., http://localhost:9428)
   * The /insert/jsonline path will be automatically appended
   * @default "http://localhost:9428"
   */
  url?: string;
  /**
   * Function to transform log data into the payload format (optional, defaults to VictoriaLogs format)
   */
  payloadTemplate?: (data: { logLevel: string; message: string; data?: Record<string, any> }) => string;
  /**
   * Function to generate stream-level fields for VictoriaLogs
   * The keys of the returned object will be used as the values for the _stream_fields parameter
   * @default () => ({})
   */
  streamFields?: () => Record<string, string>;
  /**
   * Function to generate the timestamp for the _time field
   * @default () => new Date().toISOString()
   */
  timestamp?: () => string;
  /**
   * Custom HTTP query parameters for VictoriaLogs ingestion
   * @see https://docs.victoriametrics.com/victorialogs/data-ingestion/#http-parameters
   */
  httpParameters?: Record<string, string>;
}

/**
 * VictoriaLogs transport for LogLayer.
 *
 * This transport is a thin wrapper around the HttpTransport that provides
 * VictoriaLogs specific defaults and configuration. It uses the VictoriaLogs
 * JSON stream API to send logs.
 *
 * @see https://docs.victoriametrics.com/victorialogs/data-ingestion/#json-stream-api
 */
export class VictoriaLogsTransport extends HttpTransport {
  constructor(config: VictoriaLogsTransportConfig = {}) {
    const {
      url = "http://localhost:9428",
      method = "POST",
      headers = {
        "Content-Type": "application/stream+json",
      },
      contentType = "application/stream+json",
      batchContentType = "application/stream+json",
      streamFields = () => ({}),
      timestamp = () => new Date().toISOString(),
      httpParameters = {},
      payloadTemplate = ({ logLevel, message, data }) => {
        const streamFieldsData = streamFields();
        const timeValue = timestamp();

        // Determine field names based on HTTP parameters
        const msgField = httpParameters._msg_field || "_msg";
        const timeField = httpParameters._time_field || "_time";

        return JSON.stringify({
          [msgField]: message || "(no message)",
          [timeField]: timeValue,
          level: logLevel,
          ...streamFieldsData,
          ...data,
        });
      },
      compression = false,
      maxRetries = 3,
      retryDelay = 1000,
      respectRateLimit = true,
      enableBatchSend = true,
      batchSize = 100,
      batchSendTimeout = 5000,
      batchSendDelimiter = "\n",
      maxLogSize = 1048576, // 1MB
      maxPayloadSize = 5242880, // 5MB
      enableNextJsEdgeCompat = false,
      onError,
      onDebug,
      ...restConfig
    } = config;

    // Get stream fields and use their keys as _stream_fields parameter
    const streamFieldsData = streamFields();
    const streamFieldsKeys = Object.keys(streamFieldsData);

    // Merge HTTP parameters, adding _stream_fields if streamFields has keys
    const finalHttpParameters = {
      ...httpParameters,
      ...(streamFieldsKeys.length > 0 && { _stream_fields: streamFieldsKeys.join(",") }),
    };

    // Construct the full URL with the VictoriaLogs JSON stream API endpoint and query parameters
    const baseUrl = `${url.replace(/\/$/, "")}/insert/jsonline`;
    const queryParams = new URLSearchParams(finalHttpParameters);
    const fullUrl = queryParams.toString() ? `${baseUrl}?${queryParams.toString()}` : baseUrl;

    super({
      url: fullUrl,
      method,
      headers,
      contentType,
      batchContentType,
      payloadTemplate,
      compression,
      maxRetries,
      retryDelay,
      respectRateLimit,
      enableBatchSend,
      batchSize,
      batchSendTimeout,
      batchSendDelimiter,
      maxLogSize,
      maxPayloadSize,
      enableNextJsEdgeCompat,
      onError,
      onDebug,
      ...restConfig,
    });
  }
}
