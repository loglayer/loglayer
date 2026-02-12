import type { ILogLayer, LogLevelType } from "@loglayer/shared";

/**
 * Configuration for request logging.
 * Logs when a request is received, before the route handler runs.
 */
export interface ElysiaRequestLoggingConfig {
  /**
   * The log level to use for request logs.
   * @default "info"
   */
  logLevel?: LogLevelType;
}

/**
 * Configuration for response logging.
 * Logs after the route handler completes.
 */
export interface ElysiaResponseLoggingConfig {
  /**
   * The log level to use for response logs.
   * @default "info"
   */
  logLevel?: LogLevelType;
}

/**
 * Configuration for the auto-logging feature.
 */
export interface ElysiaAutoLoggingConfig {
  /**
   * The log level to use for both request and response logs (can be overridden individually).
   * @default "info"
   */
  logLevel?: LogLevelType;

  /**
   * Array of path patterns to ignore from auto-logging.
   * Supports exact string matches and RegExp.
   * @example ["/health", /^\/internal\//]
   */
  ignore?: Array<string | RegExp>;

  /**
   * Controls request logging (fires when request is received).
   * When enabled, logs: `"incoming request"` with metadata `{ req: { method, url, remoteAddress } }`.
   * - `true`: enables request logging (default)
   * - `false`: disables request logging
   * - `object`: enables with custom configuration
   * @default true
   */
  request?: boolean | ElysiaRequestLoggingConfig;

  /**
   * Controls response logging (fires after route handler completes).
   * When enabled, logs: `"request completed"` with metadata `{ req: { method, url, remoteAddress }, res: { statusCode }, responseTime }`.
   * - `true`: enables response logging (default)
   * - `false`: disables response logging
   * - `object`: enables with custom configuration
   * @default true
   */
  response?: boolean | ElysiaResponseLoggingConfig;
}

/**
 * Configuration for the ElysiaJS LogLayer integration plugin.
 */
export interface ElysiaLogLayerConfig {
  /**
   * The LogLayer instance to use for logging.
   * A child logger will be created for each request.
   */
  instance: ILogLayer;

  /**
   * Controls request ID generation.
   * - `true`: generates a request ID using `crypto.randomUUID()` (default)
   * - `false`: disables request ID generation
   * - `function`: custom function to generate a request ID from the request
   * @default true
   */
  requestId?: boolean | ((request: Request) => string);

  /**
   * Controls automatic request/response logging.
   * - `true`: enables auto-logging with defaults (default)
   * - `false`: disables auto-logging
   * - `object`: enables auto-logging with custom configuration
   * @default true
   */
  autoLogging?: boolean | ElysiaAutoLoggingConfig;

  /**
   * Optional function to extract additional context from the request.
   * The returned object will be merged into the per-request logger's context.
   */
  contextFn?: (ctx: { request: Request; path: string }) => Record<string, any>;
}
