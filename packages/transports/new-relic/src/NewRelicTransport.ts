import type { LogLayerTransportParams } from "@loglayer/transport";
import type { LoggerlessTransportConfig } from "@loglayer/transport";
import { LoggerlessTransport } from "@loglayer/transport";

// Constants defining New Relic's API limits
const MAX_PAYLOAD_SIZE = 1_000_000; // 1MB in bytes
const MAX_ATTRIBUTES = 255;
const MAX_ATTRIBUTE_NAME_LENGTH = 255;
const MAX_ATTRIBUTE_VALUE_LENGTH = 4094;

/**
 * Error thrown when log entry validation fails.
 * This includes payload size, attribute count, and attribute name length validations.
 */
class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * Error thrown when New Relic's API rate limit is exceeded.
 * Contains the retry-after duration specified by the API.
 */
class RateLimitError extends Error {
  constructor(
    message: string,
    public retryAfter: number,
  ) {
    super(message);
    this.name = "RateLimitError";
  }
}

/**
 * Configuration options for the New Relic transport.
 */
export interface NewRelicTransportConfig extends LoggerlessTransportConfig {
  /**
   * The New Relic API key
   */
  apiKey: string;
  /**
   * The New Relic Log API endpoint
   * @default https://log-api.newrelic.com/log/v1
   */
  endpoint?: string;
  /**
   * Optional callback for error handling
   */
  onError?: (err: Error) => void;
  /**
   * Optional callback for debugging log entries before they are sent
   */
  onDebug?: (entry: Record<string, any>) => void;
  /**
   * Whether to use gzip compression
   * @default true
   */
  useCompression?: boolean;
  /**
   * Number of retry attempts before giving up
   * @default 3
   */
  maxRetries?: number;
  /**
   * Base delay between retries in milliseconds
   * @default 1000
   */
  retryDelay?: number;
  /**
   * Whether to respect rate limiting by waiting when a 429 response is received
   * @default true
   */
  respectRateLimit?: boolean;
}

/**
 * Validates a log entry against New Relic's constraints.
 * - Checks number of attributes (max 255)
 * - Validates attribute name length (max 255 characters)
 * - Truncates attribute values longer than 4094 characters
 *
 * @param logEntry - The log entry to validate
 * @returns The validated (and potentially modified) log entry
 * @throws {ValidationError} If validation fails
 */
function validateLogEntry(logEntry: Record<string, any>) {
  if (logEntry.attributes) {
    // Check number of attributes
    const attributeCount = Object.keys(logEntry.attributes).length;
    if (attributeCount > MAX_ATTRIBUTES) {
      throw new ValidationError(
        `Log entry exceeds maximum number of attributes (${MAX_ATTRIBUTES}). Found: ${attributeCount}`,
      );
    }

    // Check attribute names and values
    for (const [key, value] of Object.entries(logEntry.attributes)) {
      // Check attribute name length
      if (key.length > MAX_ATTRIBUTE_NAME_LENGTH) {
        throw new ValidationError(
          `Attribute name '${key}' exceeds maximum length (${MAX_ATTRIBUTE_NAME_LENGTH}). Length: ${key.length}`,
        );
      }

      // Check string value length
      if (typeof value === "string" && value.length > MAX_ATTRIBUTE_VALUE_LENGTH) {
        // Truncate the string value to the maximum length
        logEntry.attributes[key] = value.slice(0, MAX_ATTRIBUTE_VALUE_LENGTH);
      }
    }
  }

  return logEntry;
}

/**
 * NewRelicTransport is responsible for sending logs to New Relic's Log API.
 * It handles validation, compression, retries, and rate limiting according to New Relic's specifications.
 *
 * Features:
 * - Validates payload size (max 1MB)
 * - Validates number of attributes (max 255)
 * - Validates attribute name length (max 255 characters)
 * - Truncates attribute values longer than 4094 characters
 * - Supports gzip compression
 * - Handles rate limiting with configurable behavior
 * - Implements retry logic with exponential backoff
 */
export class NewRelicTransport extends LoggerlessTransport {
  private apiKey: string;
  private endpoint: string;
  private onError?: (err: Error) => void;
  private onDebug?: (entry: Record<string, any>) => void;
  private useCompression: boolean;
  private maxRetries: number;
  private retryDelay: number;
  private respectRateLimit: boolean;

  /**
   * Creates a new instance of NewRelicTransport.
   *
   * @param config - Configuration options for the transport
   * @param config.apiKey - New Relic API key for authentication
   * @param config.endpoint - Optional custom endpoint URL (defaults to New Relic's Log API endpoint)
   * @param config.onError - Optional error callback for handling errors
   * @param config.onDebug - Optional callback for debugging log entries before they are sent
   * @param config.useCompression - Whether to use gzip compression (defaults to true)
   * @param config.maxRetries - Maximum number of retry attempts (defaults to 3)
   * @param config.retryDelay - Base delay between retries in milliseconds (defaults to 1000)
   * @param config.respectRateLimit - Whether to honor rate limiting headers (defaults to true)
   */
  constructor(config: NewRelicTransportConfig) {
    super(config);

    this.apiKey = config.apiKey;
    this.endpoint = config.endpoint ?? "https://log-api.newrelic.com/log/v1";
    this.onError = config.onError;
    this.onDebug = config.onDebug;
    this.useCompression = config.useCompression ?? true;
    this.maxRetries = config.maxRetries ?? 3;
    this.retryDelay = config.retryDelay ?? 1000;
    this.respectRateLimit = config.respectRateLimit ?? true;
  }

  /**
   * Processes and ships log entries to New Relic.
   *
   * This method:
   * 1. Validates the message size
   * 2. Creates and validates the log entry
   * 3. Validates the final payload size
   * 4. Asynchronously sends the log entry to New Relic
   *
   * The actual sending is done asynchronously in a fire-and-forget manner to maintain
   * compatibility with the base transport class while still providing retry and error handling.
   *
   * @param params - Log parameters including level, messages, and metadata
   * @param params.logLevel - The severity level of the log
   * @param params.messages - Array of message strings to be joined
   * @param params.data - Optional metadata to include with the log
   * @param params.hasData - Whether metadata is present
   * @returns The original messages array
   * @throws {ValidationError} If the payload exceeds size limits or validation fails
   */
  shipToLogger({ logLevel, messages, data, hasData }: LogLayerTransportParams): any[] {
    try {
      // Check message size first
      const message = messages.join(" ");
      const messageBytes = new TextEncoder().encode(message).length;
      if (messageBytes > MAX_PAYLOAD_SIZE) {
        throw new ValidationError(
          `Payload size exceeds maximum of ${MAX_PAYLOAD_SIZE} bytes. Size: ${messageBytes} bytes`,
        );
      }

      const logEntry: Record<string, any> = {
        timestamp: new Date().getTime(),
        level: logLevel,
        log: message,
      };

      if (data && hasData) {
        Object.assign(logEntry, {
          attributes: data,
        });
      }

      const validatedEntry = validateLogEntry(logEntry);

      // Call onDebug callback if defined
      if (this.onDebug) {
        this.onDebug(validatedEntry);
      }

      // Check final payload size
      const payload = JSON.stringify([validatedEntry]);
      const payloadBytes = new TextEncoder().encode(payload).length;
      if (payloadBytes > MAX_PAYLOAD_SIZE) {
        throw new ValidationError(
          `Payload size exceeds maximum of ${MAX_PAYLOAD_SIZE} bytes. Size: ${payloadBytes} bytes`,
        );
      }

      // Fire and forget the async processing
      (async () => {
        try {
          await sendWithRetry(
            this.endpoint,
            this.apiKey,
            payload,
            this.useCompression,
            this.maxRetries,
            this.retryDelay,
            this.respectRateLimit,
          );
        } catch (error) {
          if (this.onError) {
            this.onError(error instanceof Error ? error : new Error(String(error)));
          }
          // Re-throw validation errors to prevent further processing
          if (error instanceof ValidationError) {
            throw error;
          }
        }
      })();
    } catch (error) {
      if (this.onError) {
        this.onError(error instanceof Error ? error : new Error(String(error)));
      }
    }

    return messages;
  }
}

/**
 * Compresses data using gzip compression.
 *
 * @param data - The string data to compress
 * @returns A promise that resolves to the compressed data as a Uint8Array
 */
async function compressData(data: string): Promise<Uint8Array> {
  const stream = new CompressionStream("gzip");
  const writer = stream.writable.getWriter();
  const encoder = new TextEncoder();
  const chunks: Uint8Array[] = [];

  await writer.write(encoder.encode(data));
  await writer.close();

  const reader = stream.readable.getReader();

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  // Combine all chunks into a single Uint8Array
  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

/**
 * Sends a log entry to New Relic with retry logic.
 * Handles rate limiting, compression, and error cases.
 *
 * @param endpoint - The New Relic API endpoint
 * @param apiKey - The New Relic API key
 * @param payload - The JSON payload to send
 * @param useCompression - Whether to use gzip compression
 * @param maxRetries - Maximum number of retry attempts
 * @param retryDelay - Base delay between retries in milliseconds
 * @param respectRateLimit - Whether to honor rate limiting headers
 * @returns A promise that resolves to the API response
 * @throws {ValidationError} If payload validation fails
 * @throws {RateLimitError} If rate limited and not respecting rate limits
 * @throws {Error} If the request fails after all retries
 */
async function sendWithRetry(
  endpoint: string,
  apiKey: string,
  payload: string,
  useCompression: boolean,
  maxRetries: number,
  retryDelay: number,
  respectRateLimit = true,
): Promise<Response> {
  // Check payload size before compression
  const payloadBytes = new TextEncoder().encode(payload).length;
  if (payloadBytes > MAX_PAYLOAD_SIZE) {
    throw new ValidationError(`Payload size exceeds maximum of ${MAX_PAYLOAD_SIZE} bytes. Size: ${payloadBytes} bytes`);
  }

  let lastError: Error;
  let compressedPayload: Uint8Array | undefined;

  if (useCompression) {
    compressedPayload = await compressData(payload);
    // Check compressed payload size
    if (compressedPayload.length > MAX_PAYLOAD_SIZE) {
      throw new ValidationError(
        `Compressed payload size exceeds maximum of ${MAX_PAYLOAD_SIZE} bytes. Size: ${compressedPayload.length} bytes`,
      );
    }
  }

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Api-Key": apiKey,
  };

  if (useCompression) {
    headers["Content-Encoding"] = "gzip";
  }

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers,
        body: useCompression ? compressedPayload : payload,
      });

      if (response.status === 429) {
        const retryAfter = Number.parseInt(response.headers.get("Retry-After") || "60", 10);
        if (respectRateLimit) {
          // Wait for the specified time before retrying
          await new Promise((resolve) => setTimeout(resolve, retryAfter * 1000));
          // Don't count rate limit retries against maxRetries
          attempt--;
          continue;
        }

        throw new RateLimitError(`Rate limit exceeded. Retry after ${retryAfter} seconds`, retryAfter);
      }

      if (!response.ok) {
        throw new Error(`Failed to send logs to New Relic: ${response.statusText}`);
      }

      return response;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry validation errors
      if (error instanceof ValidationError) {
        throw error;
      }

      // If we're not respecting rate limits, don't retry rate limit errors
      if (!respectRateLimit && error instanceof RateLimitError) {
        throw error;
      }

      if (attempt === maxRetries) {
        throw new Error(`Failed to send logs after ${maxRetries} retries: ${lastError.message}`);
      }

      // For non-rate-limit errors, use exponential backoff with jitter
      if (!(error instanceof RateLimitError)) {
        const jitter = Math.random() * 200;
        const delay = retryDelay * 2 ** attempt + jitter;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}
