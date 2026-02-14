import type { FastifyRequest } from "fastify";
import type { ILogLayer, LogLevelType } from "loglayer";

/**
 * Configuration for request logging.
 * Logs when a request is received, before the route handler runs.
 */
export interface FastifyRequestLoggingConfig {
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
export interface FastifyResponseLoggingConfig {
  /**
   * The log level to use for response logs.
   * @default "info"
   */
  logLevel?: LogLevelType;
}

/**
 * Configuration for the auto-logging feature.
 */
export interface FastifyAutoLoggingConfig {
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
  request?: boolean | FastifyRequestLoggingConfig;

  /**
   * Controls response logging (fires after response is sent).
   * When enabled, logs: `"request completed"` with metadata `{ req: { method, url, remoteAddress }, res: { statusCode }, responseTime }`.
   * - `true`: enables response logging (default)
   * - `false`: disables response logging
   * - `object`: enables with custom configuration
   * @default true
   */
  response?: boolean | FastifyResponseLoggingConfig;
}

/**
 * Group routing configuration for the integration.
 * Controls which groups are assigned to logs from this integration.
 */
export interface FastifyGroupConfig {
  /**
   * Group applied to all logs (user-generated and auto-logged) from this integration.
   */
  name?: string | string[];

  /**
   * Additional group applied to auto-logged incoming request messages.
   * Additive with the main group.
   */
  request?: string | string[];

  /**
   * Additional group applied to auto-logged response messages.
   * Additive with the main group.
   */
  response?: string | string[];
}

/**
 * Configuration for the Fastify LogLayer integration plugin.
 */
export interface FastifyLogLayerConfig {
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
  requestId?: boolean | ((request: FastifyRequest) => string);

  /**
   * Controls automatic request/response logging.
   * - `true`: enables auto-logging with defaults (default)
   * - `false`: disables auto-logging
   * - `object`: enables auto-logging with custom configuration
   * @default true
   */
  autoLogging?: boolean | FastifyAutoLoggingConfig;

  /**
   * Optional function to extract additional context from the request.
   * The returned object will be merged into the per-request logger's context.
   */
  contextFn?: (request: FastifyRequest) => Record<string, any>;

  /**
   * Assigns groups to all logs from this integration for transport routing.
   * - `string`: tag all logs with this group
   * - `string[]`: tag all logs with multiple groups
   * - `object`: configure main, request, and response groups individually
   *
   * @see {@link https://loglayer.dev/logging-api/groups.html | Groups Docs}
   */
  group?: string | string[] | FastifyGroupConfig;
}
