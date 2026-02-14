import type Koa from "koa";
import type { ILogLayer, LogLevelType } from "loglayer";

/**
 * Configuration for request logging.
 * Logs when a request is received, before the route handler runs.
 */
export interface KoaRequestLoggingConfig {
  /**
   * The log level to use for request logs.
   * @default "info"
   */
  logLevel?: LogLevelType;
}

/**
 * Configuration for response logging.
 * Logs after the route handler completes and the response is sent.
 */
export interface KoaResponseLoggingConfig {
  /**
   * The log level to use for response logs.
   * @default "info"
   */
  logLevel?: LogLevelType;
}

/**
 * Configuration for the auto-logging feature.
 */
export interface KoaAutoLoggingConfig {
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
  request?: boolean | KoaRequestLoggingConfig;

  /**
   * Controls response logging (fires after response is sent).
   * When enabled, logs: `"request completed"` with metadata `{ req: { method, url, remoteAddress }, res: { statusCode }, responseTime }`.
   * - `true`: enables response logging (default)
   * - `false`: disables response logging
   * - `object`: enables with custom configuration
   * @default true
   */
  response?: boolean | KoaResponseLoggingConfig;
}

/**
 * Group names for auto-logged messages.
 */
export interface KoaGroupConfig {
  /**
   * Group name for internal auto-logs (errors, etc.).
   * @default "koa"
   */
  name?: string;

  /**
   * Group name for auto-logged incoming request messages.
   * @default "koa.request"
   */
  request?: string;

  /**
   * Group name for auto-logged response messages.
   * @default "koa.response"
   */
  response?: string;
}

/**
 * Configuration for the Koa LogLayer integration middleware.
 */
export interface KoaLogLayerConfig {
  /**
   * The LogLayer instance to use for logging.
   * A child logger will be created for each request.
   */
  instance: ILogLayer;

  /**
   * Controls request ID generation.
   * - `true`: generates a request ID using `crypto.randomUUID()` (default)
   * - `false`: disables request ID generation
   * - `function`: custom function to generate a request ID from the Koa context
   * @default true
   */
  requestId?: boolean | ((ctx: Koa.Context) => string);

  /**
   * Controls automatic request/response logging.
   * - `true`: enables auto-logging with defaults (default)
   * - `false`: disables auto-logging
   * - `object`: enables auto-logging with custom configuration
   * @default true
   */
  autoLogging?: boolean | KoaAutoLoggingConfig;

  /**
   * Optional function to extract additional context from the Koa context.
   * The returned object will be merged into the per-request logger's context.
   */
  contextFn?: (ctx: Koa.Context) => Record<string, any>;

  /**
   * Tags auto-logged request/response messages with groups for filtering/routing.
   * - `true`: tag with default group names (`"koa.request"`, `"koa.response"`)
   * - `object`: tag with custom group names
   *
   * Only affects auto-logged messages. User logs from route handlers are not tagged.
   *
   * @see {@link https://loglayer.dev/logging-api/groups.html | Groups Docs}
   */
  group?: boolean | KoaGroupConfig;
}
