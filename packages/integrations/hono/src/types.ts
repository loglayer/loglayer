import type { ILogLayer, LogLevelType } from "loglayer";

/**
 * Context variables added by the honoLogLayer middleware.
 * Merge this into your Hono Env type for type safety with `c.var.logger`.
 *
 * @example
 * ```typescript
 * import { Hono } from "hono";
 * import { honoLogLayer, type HonoLogLayerVariables } from "@loglayer/hono";
 *
 * const app = new Hono<{ Variables: HonoLogLayerVariables }>();
 * app.use(honoLogLayer({ instance: log }));
 *
 * // With other variables:
 * type AppEnv = { Variables: HonoLogLayerVariables & { user: User } };
 * const app = new Hono<AppEnv>();
 * ```
 */
export type HonoLogLayerVariables = {
  logger: ILogLayer;
};

/**
 * Configuration for request logging.
 * Logs when a request is received, before the route handler runs.
 */
export interface HonoRequestLoggingConfig {
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
export interface HonoResponseLoggingConfig {
  /**
   * The log level to use for response logs.
   * @default "info"
   */
  logLevel?: LogLevelType;
}

/**
 * Configuration for the auto-logging feature.
 */
export interface HonoAutoLoggingConfig {
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
  request?: boolean | HonoRequestLoggingConfig;

  /**
   * Controls response logging (fires after response is sent).
   * When enabled, logs: `"request completed"` with metadata `{ req: { method, url, remoteAddress }, res: { statusCode }, responseTime }`.
   * - `true`: enables response logging (default)
   * - `false`: disables response logging
   * - `object`: enables with custom configuration
   * @default true
   */
  response?: boolean | HonoResponseLoggingConfig;
}

/**
 * Group routing configuration for the integration.
 * Controls which groups are assigned to logs from this integration.
 */
export interface HonoGroupConfig {
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
 * Configuration for the Hono LogLayer integration middleware.
 */
export interface HonoLogLayerConfig {
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
  autoLogging?: boolean | HonoAutoLoggingConfig;

  /**
   * Optional function to extract additional context from the request.
   * The returned object will be merged into the per-request logger's context.
   */
  contextFn?: (context: { request: Request; path: string }) => Record<string, any>;

  /**
   * Assigns groups to all logs from this integration for transport routing.
   * - `string`: tag all logs with this group
   * - `string[]`: tag all logs with multiple groups
   * - `object`: configure main, request, and response groups individually
   *
   * @see {@link https://loglayer.dev/logging-api/groups.html | Groups Docs}
   */
  group?: string | string[] | HonoGroupConfig;
}
