/**
 * Error thrown when HTTP request fails
 */
export class HttpTransportError extends Error {
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
export class RateLimitError extends Error {
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
export class LogSizeError extends Error {
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
