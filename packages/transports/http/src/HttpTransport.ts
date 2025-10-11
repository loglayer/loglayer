import type { LoggerlessTransportConfig, LogLayerTransportParams } from "@loglayer/transport";
import { LoggerlessTransport } from "@loglayer/transport";

/**
 * Error thrown when HTTP request fails
 */
class HttpTransportError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: Response,
  ) {
    super(message);
    this.name = "HttpTransportError";
  }
}

/**
 * Error thrown when rate limit is exceeded
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
 * Error thrown when log entry exceeds size limits
 */
class LogSizeError extends Error {
  constructor(
    message: string,
    public logEntry: Record<string, any>,
    public size: number,
    public limit: number,
  ) {
    super(message);
    this.name = "LogSizeError";
  }
}

/**
 * Configuration options for the HTTP transport.
 */
export interface HttpTransportConfig extends LoggerlessTransportConfig {
  /**
   * The URL to send logs to
   */
  url: string;
  /**
   * HTTP method to use for requests
   * @default "POST"
   */
  method?: string;
  /**
   * Headers to include in the request. Can be an object or a function that returns headers.
   */
  headers?: Record<string, string> | (() => Record<string, string>);
  /**
   * Content type for single log requests. User-specified headers take precedence.
   * @default "application/json"
   */
  contentType?: string;
  /**
   * Content type for batch log requests. User-specified headers take precedence.
   * @default "application/json"
   */
  batchContentType?: string;
  /**
   * Optional callback for error handling
   */
  onError?: (err: Error) => void;
  /**
   * Optional callback for debugging log entries before they are sent
   */
  onDebug?: (entry: Record<string, any>) => void;
  /**
   * Optional callback for debugging HTTP requests and responses
   */
  onDebugReqRes?: (reqRes: { req: { url: string; method: string; headers: Record<string, string>; body: string | Uint8Array }; res: { status: number; statusText: string; headers: Record<string, string>; body: string } }) => void;
  /**
   * Function to transform log data into the payload format
   */
  payloadTemplate: (data: { logLevel: string; message: string; data?: Record<string, any> }) => string;
  /**
   * Whether to use gzip compression
   * @default false
   */
  compression?: boolean;
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
  /**
   * Whether to enable batch sending
   * @default true
   */
  enableBatchSend?: boolean;
  /**
   * Number of log entries to batch before sending
   * @default 100
   */
  batchSize?: number;
  /**
   * Timeout in milliseconds for sending batches regardless of size
   * @default 5000
   */
  batchSendTimeout?: number;
  /**
   * Delimiter to use between log entries in batch mode
   * @default "\n"
   */
  batchSendDelimiter?: string;
  /**
   * Batch mode for sending multiple log entries
   * - "delimiter": Join entries with a delimiter (default)
   * - "field": Wrap entries in an object with a field name
   * - "array": Send entries as a plain JSON array
   * @default "delimiter"
   */
  batchMode?: "delimiter" | "field" | "array";
  /**
   * Field name to wrap batch entries in when batchMode is "field" (e.g., "batch" for Logflare)
   * @default undefined
   */
  batchFieldName?: string;
  /**
   * Maximum size of a single log entry in bytes
   * @default 1048576 (1MB)
   */
  maxLogSize?: number;
  /**
   * Maximum size of the payload (uncompressed) in bytes
   * @default 5242880 (5MB)
   */
  maxPayloadSize?: number;
  /**
   * Whether to enable Next.js Edge Runtime compatibility mode
   * When enabled, TextEncoder and compression are disabled
   * @default false
   */
  enableNextJsEdgeCompat?: boolean;
}

/**
 * Compresses data using gzip compression
 */
async function compressData(data: string): Promise<Uint8Array> {
  const encoder = new TextEncoder();
  const dataBytes = encoder.encode(data);

  // Use the CompressionStream API if available (modern browsers)
  if (typeof CompressionStream !== "undefined") {
    const stream = new CompressionStream("gzip");
    const writer = stream.writable.getWriter();
    const reader = stream.readable.getReader();

    await writer.write(dataBytes);
    await writer.close();

    const chunks: Uint8Array[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }

    return result;
  }

  // Fallback for Node.js or environments without CompressionStream
  // In a real implementation, you might want to use a library like 'zlib' for Node.js
  throw new Error("Gzip compression not supported in this environment");
}

/**
 * Sends HTTP request with retry logic and rate limiting
 */
async function sendWithRetry(
  url: string,
  method: string,
  headers: Record<string, string>,
  payload: string | Uint8Array,
  maxRetries: number,
  retryDelay: number,
  respectRateLimit = true,
  onDebugReqRes?: (reqRes: { req: { url: string; method: string; headers: Record<string, string>; body: string | Uint8Array }; res: { status: number; statusText: string; headers: Record<string, string>; body: string } }) => void,
  onError?: (err: Error) => void,
): Promise<Response> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method,
        headers,
        body: payload,
      });

      // Call debug callback if provided
      if (onDebugReqRes) {
        try {
          const responseBody = await response.clone().text();
          const responseHeaders: Record<string, string> = {};
          response.headers.forEach((value, key) => {
            responseHeaders[key] = value;
          });

          onDebugReqRes({
            req: {
              url,
              method,
              headers,
              body: payload,
            },
            res: {
              status: response.status,
              statusText: response.statusText,
              headers: responseHeaders,
              body: responseBody,
            },
          });
        } catch (debugError) {
          // Don't let debug callback errors break the main flow
          if (onError) {
            onError(new Error(`Debug callback error: ${debugError}`));
          }
        }
      }

      // Handle rate limiting
      if (response.status === 429 && respectRateLimit) {
        const retryAfter = response.headers.get("retry-after");
        const waitTime = retryAfter ? Number.parseInt(retryAfter, 10) * 1000 : retryDelay;

        throw new RateLimitError(`Rate limit exceeded. Retry after ${waitTime}ms`, waitTime);
      }

      // Check for non-200 status codes and log if onError is enabled
      if (response.status !== 200 && onError) {
        onError(new Error(`HTTP request failed with status ${response.status}: ${response.statusText}`));
      }

      // Handle other errors
      if (!response.ok) {
        throw new HttpTransportError(`HTTP ${response.status}: ${response.statusText}`, response.status, response);
      }

      return response;
    } catch (error) {
      lastError = error as Error;

      // If it's a rate limit error and we should respect it, wait and retry
      if (error instanceof RateLimitError && respectRateLimit) {
        await new Promise((resolve) => setTimeout(resolve, error.retryAfter));
        continue;
      }

      // If it's the last attempt, throw the error
      if (attempt === maxRetries) {
        throw error;
      }

      // Wait before retrying with exponential backoff
      const waitTime = retryDelay * 2 ** attempt;
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  throw lastError!;
}

/**
 * HttpTransport is responsible for sending logs to any HTTP endpoint.
 * It supports batching, compression, retries, and rate limiting.
 *
 * Features:
 * - Configurable HTTP method and headers
 * - Custom payload template function
 * - Gzip compression support
 * - Retry logic with exponential backoff
 * - Rate limiting support
 * - Batch sending with configurable size and timeout
 * - Error and debug callbacks
 * - Log size validation
 * - Payload size tracking for batching
 */
export class HttpTransport extends LoggerlessTransport {
  private url: string;
  private method: string;
  private headers: Record<string, string> | (() => Record<string, string>);
  private contentType: string;
  private batchContentType: string;
  private onError?: (err: Error) => void;
  private onDebug?: (entry: Record<string, any>) => void;
  private onDebugReqRes?: (reqRes: { req: { url: string; method: string; headers: Record<string, string>; body: string | Uint8Array }; res: { status: number; statusText: string; headers: Record<string, string>; body: string } }) => void;
  private payloadTemplate: (data: { logLevel: string; message: string; data?: Record<string, any> }) => string;
  private compression: boolean;
  private maxRetries: number;
  private retryDelay: number;
  private respectRateLimit: boolean;
  private enableBatchSend: boolean;
  private batchSize: number;
  private batchSendTimeout: number;
  private batchSendDelimiter: string;
  private batchMode: "delimiter" | "field" | "array";
  private batchFieldName?: string;
  private maxLogSize: number;
  private maxPayloadSize: number;
  private enableNextJsEdgeCompat: boolean;

  // Batch management
  private batchQueue: string[] = [];
  private batchTimeout?: NodeJS.Timeout;
  private isProcessingBatch = false;
  private currentBatchSize = 0; // Track uncompressed size of current batch

  /**
   * Creates a new instance of HttpTransport.
   *
   * @param config - Configuration options for the transport
   */
  constructor(config: HttpTransportConfig) {
    super(config);

    this.url = config.url;
    this.method = config.method ?? "POST";
    this.headers = config.headers ?? {};
    this.contentType = config.contentType ?? "application/json";
    this.batchContentType = config.batchContentType ?? "application/json";
    this.onError = config.onError;
    this.onDebug = config.onDebug;
    this.onDebugReqRes = config.onDebugReqRes;
    this.payloadTemplate = config.payloadTemplate;
    this.compression = config.compression ?? false;
    this.maxRetries = config.maxRetries ?? 3;
    this.retryDelay = config.retryDelay ?? 1000;
    this.respectRateLimit = config.respectRateLimit ?? true;
    this.enableBatchSend = config.enableBatchSend ?? true;
    this.batchSize = config.batchSize ?? 100;
    this.batchSendTimeout = config.batchSendTimeout ?? 5000;
    this.batchSendDelimiter = config.batchSendDelimiter ?? "\n";
    this.batchMode = config.batchMode ?? "delimiter";
    this.batchFieldName = config.batchFieldName;

    // Validate that batchFieldName is provided when batchMode is "field"
    if (this.batchMode === "field" && !this.batchFieldName) {
      throw new Error("batchFieldName is required when batchMode is 'field'");
    }
    this.maxLogSize = config.maxLogSize ?? 1048576; // 1MB
    this.maxPayloadSize = config.maxPayloadSize ?? 5242880; // 5MB
    this.enableNextJsEdgeCompat = config.enableNextJsEdgeCompat ?? false;
  }

  /**
   * Processes and ships log entries to the HTTP endpoint.
   *
   * @param params - Log parameters including level, messages, and metadata
   * @returns The original messages array
   */
  shipToLogger({ logLevel, messages, data, hasData }: LogLayerTransportParams): any[] {
    try {
      const message = messages.join(" ");

      const payloadTemplate = {
        logLevel,
        message,
      };

      if (hasData) {
        payloadTemplate["data"] = data;
      }

      const payload = this.payloadTemplate(payloadTemplate);

      if (this.onDebug) {
        this.onDebug({ logLevel, message, data });
      }

      // Check log entry size
      let logEntrySize: number;

      if (this.enableNextJsEdgeCompat || typeof TextEncoder === "undefined") {
        // Fallback for environments without TextEncoder (like Next.js Edge Runtime)
        logEntrySize = Buffer.byteLength(payload, "utf8");
      } else {
        logEntrySize = new TextEncoder().encode(payload).length;
      }

      if (logEntrySize > this.maxLogSize) {
        const error = new LogSizeError(
          `Log entry exceeds maximum size of ${this.maxLogSize} bytes. Size: ${logEntrySize} bytes`,
          { logLevel, message, data },
          logEntrySize,
          this.maxLogSize,
        );

        if (this.onError) {
          this.onError(error);
        }
        return messages;
      }

      if (this.enableBatchSend) {
        this.addToBatch(payload, logEntrySize);
      } else {
        // Send immediately
        this.sendPayload(payload).catch((err) => {
          if (this.onError) {
            this.onError(err);
          }
        });
      }
    } catch (error) {
      if (this.onError) {
        this.onError(error as Error);
      }
    }

    return messages;
  }

  /**
   * Adds a payload to the batch queue and triggers sending if conditions are met
   */
  private addToBatch(payload: string, logEntrySize: number): void {
    // Check if adding this entry would exceed payload size limit
    const payloadSizeWithEntry = this.currentBatchSize + logEntrySize + this.batchSendDelimiter.length;
    const payloadSizeThreshold = this.maxPayloadSize * 0.9; // 90% of max payload size

    // Force send if adding this entry would exceed 90% of max payload size
    if (payloadSizeWithEntry > payloadSizeThreshold && this.batchQueue.length > 0) {
      this.processBatch();
    }

    this.batchQueue.push(payload);
    this.currentBatchSize += logEntrySize + this.batchSendDelimiter.length;

    // Start batch timeout if not already running
    if (!this.batchTimeout) {
      this.batchTimeout = setTimeout(() => {
        this.processBatch();
      }, this.batchSendTimeout);
    }

    // Send immediately if batch size is reached
    if (this.batchQueue.length >= this.batchSize) {
      this.processBatch();
    }
  }

  /**
   * Processes the current batch and sends it to the HTTP endpoint
   */
  private async processBatch(): Promise<void> {
    if (this.isProcessingBatch || this.batchQueue.length === 0) {
      return;
    }

    this.isProcessingBatch = true;

    // Clear the timeout
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = undefined;
    }

    // Get the current batch
    const batch = this.batchQueue.splice(0, this.batchSize);

    // Reset batch size counter
    this.currentBatchSize = 0;

    try {
      await this.sendBatch(batch);
    } catch (error) {
      if (this.onError) {
        this.onError(error as Error);
      }
    } finally {
      this.isProcessingBatch = false;

      // If there are more items in the queue, process them
      if (this.batchQueue.length > 0) {
        this.processBatch();
      }
    }
  }

  /**
   * Sends a batch of payloads to the HTTP endpoint
   */
  private async sendBatch(batch: string[]): Promise<void> {
    let batchPayload: string;
    
    switch (this.batchMode) {
      case "array":
        // Send batch entries as a plain JSON array
        const batchEntries = batch.map(payload => JSON.parse(payload));
        batchPayload = JSON.stringify(batchEntries);
        break;
      case "field":
        // Parse each payload as JSON and create a batch object
        const fieldEntries = batch.map(payload => JSON.parse(payload));
        const batchObject = { [this.batchFieldName!]: fieldEntries };
        batchPayload = JSON.stringify(batchObject);
        break;
      case "delimiter":
      default:
        // Use delimiter-based batching (default behavior)
        batchPayload = batch.join(this.batchSendDelimiter);
        break;
    }
    
    await this.sendPayload(batchPayload, this.batchContentType);
  }

  /**
   * Sends a single payload to the HTTP endpoint
   */
  private async sendPayload(payload: string, contentType?: string): Promise<void> {
    // Get headers
    const headers: Record<string, string> = typeof this.headers === "function" ? this.headers() : { ...this.headers };

    // Set content type - user headers take precedence
    if (!headers["content-type"]) {
      headers["content-type"] = contentType ?? this.contentType;
    }

    let finalPayload: string | Uint8Array = payload;

    // Apply compression if enabled and not in Next.js Edge compatibility mode
    if (this.compression && !this.enableNextJsEdgeCompat) {
      try {
        finalPayload = await compressData(payload);
        headers["content-encoding"] = "gzip";
      } catch (error) {
        // If compression fails, fall back to uncompressed
        if (this.onError) {
          this.onError(new Error(`Compression failed: ${error}`));
        }
      }
    }

    await sendWithRetry(
      this.url,
      this.method,
      headers,
      finalPayload,
      this.maxRetries,
      this.retryDelay,
      this.respectRateLimit,
      this.onDebugReqRes,
      this.onError,
    );
  }
}
