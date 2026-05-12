import type { HttpTransportConfig } from "@loglayer/transport-http";
import { HttpTransport } from "@loglayer/transport-http";

// Constants defining New Relic's API limits
const MAX_ATTRIBUTES = 255;
const MAX_ATTRIBUTE_NAME_LENGTH = 255;
const MAX_ATTRIBUTE_VALUE_LENGTH = 4094;

/**
 * Error thrown when log entry validation fails.
 * This includes attribute count, attribute name length, and other New Relic API validations.
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Configuration options for the New Relic transport.
 * Extends HttpTransportConfig with New Relic-specific options.
 */
export interface NewRelicTransportConfig extends Omit<HttpTransportConfig, "url" | "headers" | "payloadTemplate"> {
  /**
   * The New Relic API key
   */
  apiKey: string;
  /**
   * The New Relic Log API endpoint
   * @default "https://log-api.newrelic.com/log/v1"
   */
  endpoint?: string;
  /**
   * Custom payload template function (optional, defaults to New Relic format).
   * Receives log level, message, and optional data (metadata).
   */
  payloadTemplate?: (params: { logLevel: string; message: string; data?: Record<string, any> }) => string;
}

/**
 * Validates attributes against New Relic's constraints.
 * - Checks number of attributes (max 255)
 * - Validates attribute name length (max 255 characters)
 * - Truncates attribute values longer than 4094 characters
 *
 * @param attributes - The attributes to validate
 * @returns The validated (and potentially modified) attributes
 * @throws {ValidationError} If validation fails
 */
function validateAttributes(attributes: Record<string, any>): Record<string, any> {
  const validated: Record<string, any> = {};

  // Check number of attributes
  const attributeCount = Object.keys(attributes).length;
  if (attributeCount > MAX_ATTRIBUTES) {
    throw new ValidationError(
      `Log entry exceeds maximum number of attributes (${MAX_ATTRIBUTES}). Found: ${attributeCount}`,
    );
  }

  // Check attribute names and values
  for (const [key, value] of Object.entries(attributes)) {
    // Check attribute name length
    if (key.length > MAX_ATTRIBUTE_NAME_LENGTH) {
      throw new ValidationError(
        `Attribute name exceeds maximum length (${MAX_ATTRIBUTE_NAME_LENGTH}). Found: ${key.length}`,
      );
    }

    // Truncate string values that are too long
    if (typeof value === "string" && value.length > MAX_ATTRIBUTE_VALUE_LENGTH) {
      validated[key] = value.slice(0, MAX_ATTRIBUTE_VALUE_LENGTH);
    } else {
      validated[key] = value;
    }
  }

  return validated;
}

/**
 * Default payload template that formats log data for New Relic's Log API.
 * Each entry includes timestamp, level, the log message, and optional attributes.
 */
function defaultNewRelicPayload(params: { logLevel: string; message: string; data?: Record<string, any> }): string {
  const logEntry: Record<string, any> = {
    timestamp: Date.now(),
    level: params.logLevel,
    log: params.message,
  };

  if (params.data) {
    logEntry.attributes = validateAttributes(params.data);
  }

  return JSON.stringify(logEntry);
}

/**
 * NewRelicTransport is responsible for sending logs to New Relic's Log API.
 * It extends HttpTransport with New Relic-specific configuration, validation,
 * and formatting.
 *
 * Features:
 * - Validates attribute count (max 255)
 * - Validates attribute name length (max 255 characters)
 * - Truncates attribute values longer than 4094 characters
 * - Gzip compression by default (via HttpTransport)
 * - Retry logic with exponential backoff (via HttpTransport)
 * - Rate limiting support (via HttpTransport)
 * - Batch sending support (via HttpTransport)
 * - Error and debug callbacks
 */
export class NewRelicTransport extends HttpTransport {
  /**
   * Creates a new instance of NewRelicTransport.
   *
   * @param config - Configuration options for the transport
   */
  constructor(config: NewRelicTransportConfig) {
    const { apiKey, endpoint, payloadTemplate, ...httpConfig } = config;

    super({
      ...httpConfig,
      url: endpoint ?? "https://log-api.newrelic.com/log/v1",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Api-Key": apiKey,
      },
      payloadTemplate: payloadTemplate ?? defaultNewRelicPayload,
      // Defaults (only apply if not provided)
      compression: httpConfig.compression ?? true,
      maxRetries: httpConfig.maxRetries ?? 3,
      retryDelay: httpConfig.retryDelay ?? 1000,
      respectRateLimit: httpConfig.respectRateLimit ?? true,
      maxLogSize: httpConfig.maxLogSize ?? 1_048_576,
      maxPayloadSize: httpConfig.maxPayloadSize ?? 1_048_576,
    } as HttpTransportConfig);
  }
}
