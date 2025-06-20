import { LoggerlessTransport, type LoggerlessTransportConfig, type LogLayerTransportParams } from "@loglayer/transport";

interface SumoLogicTransportConfig extends LoggerlessTransportConfig {
  /**
   * The URL of your HTTP Source endpoint
   */
  url: string;

  /**
   * Whether to use gzip compression (defaults to true)
   */
  useCompression?: boolean;

  /**
   * Source category to assign to the logs (optional)
   */
  sourceCategory?: string;

  /**
   * Source name to assign to the logs (optional)
   */
  sourceName?: string;

  /**
   * Source host to assign to the logs (optional)
   */
  sourceHost?: string;

  /**
   * Fields to be added as X-Sumo-Fields header (optional)
   * Will be formatted as a comma-separated list of key=value pairs
   */
  fields?: Record<string, string>;

  /**
   * Custom headers to be added to the request (optional)
   */
  headers?: Record<string, string>;

  /**
   * Retry configuration (optional)
   */
  retryConfig?: {
    maxRetries?: number;
    initialRetryMs?: number;
  };

  /**
   * Optional callback for error handling
   */
  onError?: (error: Error | string) => void;

  /**
   * Field name to use for the message (defaults to "message")
   */
  messageField?: string;
}

const MAX_PAYLOAD_SIZE = 1000000; // 1MB limit as per SumoLogic docs

export class SumoLogicTransport extends LoggerlessTransport {
  private url: string;
  private useCompression: boolean;
  private sourceCategory?: string;
  private sourceName?: string;
  private sourceHost?: string;
  private fields: Record<string, string>;
  private headers: Record<string, string>;
  private maxRetries: number;
  private initialRetryMs: number;
  private onError?: (error: Error | string) => void;
  private messageField: string;

  constructor(config: SumoLogicTransportConfig) {
    super(config);
    this.url = config.url;
    this.useCompression = config.useCompression ?? true;
    this.sourceCategory = config.sourceCategory;
    this.sourceName = config.sourceName;
    this.sourceHost = config.sourceHost;
    this.fields = config.fields ?? {};
    this.headers = config.headers ?? {};
    this.maxRetries = config.retryConfig?.maxRetries ?? 3;
    this.initialRetryMs = config.retryConfig?.initialRetryMs ?? 1000;
    this.onError = config.onError;
    this.messageField = config.messageField ?? "message";
  }

  /**
   * Compresses data using gzip compression.
   */
  private async compressData(data: string): Promise<Uint8Array> {
    const stream = new CompressionStream("gzip");
    const writer = stream.writable.getWriter();
    const textEncoder = new TextEncoder();
    const chunks: Uint8Array[] = [];

    await writer.write(textEncoder.encode(data));
    await writer.close();

    const reader = stream.readable.getReader();

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
    const result = new Uint8Array(totalLength);
    let offset = 0;

    for (const chunk of chunks) {
      result.set(chunk, offset);
      offset += chunk.length;
    }

    return result;
  }

  /**
   * Handles errors by calling the onError callback if defined
   */
  private handleError(error: Error | string): void {
    if (this.onError) {
      this.onError(error);
    }
  }

  /**
   * Sends logs to SumoLogic with retry logic, compression, and size validation.
   */
  private async sendToSumoLogic(payload: string, retryCount = 0): Promise<void> {
    try {
      // Check payload size before compression
      const rawSize = new TextEncoder().encode(payload).length;
      if (rawSize > MAX_PAYLOAD_SIZE) {
        const error = `Payload size exceeds maximum of ${MAX_PAYLOAD_SIZE} bytes. Size: ${rawSize} bytes`;
        this.handleError(error);
        return;
      }

      let compressedPayload: Uint8Array | undefined;
      if (this.useCompression) {
        compressedPayload = await this.compressData(payload);
        if (compressedPayload.length > MAX_PAYLOAD_SIZE) {
          const error = `Compressed payload size exceeds maximum of ${MAX_PAYLOAD_SIZE} bytes. Size: ${compressedPayload.length} bytes`;
          this.handleError(error);
          return;
        }
      }

      const headers: Record<string, string> = {
        ...this.headers,
        "Content-Type": "application/json",
      };

      if (this.sourceCategory) {
        headers["X-Sumo-Category"] = this.sourceCategory;
      }
      if (this.sourceName) {
        headers["X-Sumo-Name"] = this.sourceName;
      }
      if (this.sourceHost) {
        headers["X-Sumo-Host"] = this.sourceHost;
      }
      if (this.useCompression) {
        headers["Content-Encoding"] = "gzip";
      }
      if (Object.keys(this.fields).length > 0) {
        headers["X-Sumo-Fields"] = Object.entries(this.fields)
          .map(([key, value]) => `${key}=${value}`)
          .join(",");
      }

      const response = (await fetch(this.url, {
        method: "POST",
        headers,
        body: this.useCompression ? compressedPayload : payload,
      })) as Response;

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      if (retryCount < this.maxRetries) {
        const delay = this.initialRetryMs * 2 ** retryCount;
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.sendToSumoLogic(payload, retryCount + 1);
      }
      this.handleError(error instanceof Error ? error : String(error));
    }
  }

  shipToLogger({ logLevel, messages, data, hasData }: LogLayerTransportParams): any[] {
    // Only use the string messages for content
    const stringMessages = messages.filter((msg) => typeof msg === "string");
    const message = stringMessages.join(" ");

    const payload = {
      severity: logLevel,
      timestamp: new Date().toISOString(),
      ...(data && hasData ? data : {}),
    };

    if (message) {
      payload[this.messageField] = message;
    }

    this.sendToSumoLogic(JSON.stringify(payload));

    return messages;
  }
}
