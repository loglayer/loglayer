import { createMiddleware } from "hono/factory";
import type { ILogLayer } from "loglayer";
import type {
  HonoAutoLoggingConfig,
  HonoLogLayerConfig,
  HonoLogLayerVariables,
  HonoRequestLoggingConfig,
  HonoResponseLoggingConfig,
} from "./types.js";

function resolveGroupConfig(group: HonoLogLayerConfig["group"]) {
  if (!group) return { requestGroup: undefined, responseGroup: undefined };
  if (group === true) return { requestGroup: "hono.request", responseGroup: "hono.response" };
  return { requestGroup: group.request ?? "hono.request", responseGroup: group.response ?? "hono.response" };
}

function shouldIgnorePath(path: string, ignore?: Array<string | RegExp>): boolean {
  if (!ignore || ignore.length === 0) return false;

  for (const pattern of ignore) {
    if (typeof pattern === "string") {
      if (path === pattern) return true;
    } else if (pattern.test(path)) {
      return true;
    }
  }

  return false;
}

function getRequestId(request: Request, requestIdConfig: HonoLogLayerConfig["requestId"]): string | undefined {
  if (requestIdConfig === false) return undefined;
  if (typeof requestIdConfig === "function") return requestIdConfig(request);
  return crypto.randomUUID();
}

function getRemoteAddress(request: Request): string | undefined {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  return undefined;
}

function resolveLoggingConfig<T>(value: boolean | T | undefined, defaultEnabled: boolean): T | false {
  if (value === undefined) return defaultEnabled ? ({} as T) : false;
  if (value === true) return {} as T;
  if (value === false) return false;
  return value;
}

/**
 * Creates a Hono middleware that integrates LogLayer for request-scoped logging.
 *
 * The middleware sets a child LogLayer instance on `c.var.logger` for each request.
 *
 * @example
 * ```typescript
 * import { Hono } from "hono";
 * import { LogLayer, ConsoleTransport } from "loglayer";
 * import { honoLogLayer } from "@loglayer/hono";
 *
 * const log = new LogLayer({ transport: new ConsoleTransport() });
 *
 * const app = new Hono();
 * app.use(honoLogLayer({ instance: log }));
 *
 * app.get("/", (c) => {
 *   c.var.logger.info("Hello from route!");
 *   return c.text("Hello World!");
 * });
 * ```
 */
export function honoLogLayer(config: HonoLogLayerConfig) {
  const {
    instance,
    requestId: requestIdConfig = true,
    autoLogging: autoLoggingConfig = true,
    contextFn,
    group: groupConfig = true,
  } = config;
  const { requestGroup, responseGroup } = resolveGroupConfig(groupConfig);

  const autoLogging: HonoAutoLoggingConfig | false =
    autoLoggingConfig === true ? {} : autoLoggingConfig === false ? false : autoLoggingConfig;

  // Resolve auto-logging configs once
  const requestConfig = autoLogging ? resolveLoggingConfig<HonoRequestLoggingConfig>(autoLogging.request, true) : false;
  const responseConfig = autoLogging
    ? resolveLoggingConfig<HonoResponseLoggingConfig>(autoLogging.response, true)
    : false;

  const defaultLogLevel = autoLogging ? (autoLogging.logLevel ?? "info") : "info";
  const requestLogLevel = requestConfig ? (requestConfig.logLevel ?? defaultLogLevel) : defaultLogLevel;
  const responseLogLevel = responseConfig ? (responseConfig.logLevel ?? defaultLogLevel) : defaultLogLevel;

  return createMiddleware<{
    Variables: HonoLogLayerVariables;
  }>(async (c, next) => {
    const path = c.req.path;
    const context: Record<string, any> = {};

    const reqId = getRequestId(c.req.raw, requestIdConfig);
    if (reqId) {
      context.requestId = reqId;
    }

    if (contextFn) {
      const additionalContext = contextFn({ request: c.req.raw, path });
      if (additionalContext) {
        Object.assign(context, additionalContext);
      }
    }

    const childLogger = instance.child().withContext(context) as ILogLayer;
    c.set("logger", childLogger);

    const startTime = Date.now();
    const remoteAddress = getRemoteAddress(c.req.raw);
    const ignorePath = autoLogging ? shouldIgnorePath(path, autoLogging.ignore) : true;

    // Log incoming request
    if (requestConfig && !ignorePath) {
      let builder = childLogger.withMetadata({
        req: {
          method: c.req.method,
          url: path,
          remoteAddress,
        },
      });
      if (requestGroup) builder = builder.withGroup(requestGroup);
      builder[requestLogLevel]("incoming request");
    }

    await next();

    // Log response
    if (responseConfig && !ignorePath) {
      const responseTime = Date.now() - startTime;

      let builder = childLogger.withMetadata({
        req: {
          method: c.req.method,
          url: path,
          remoteAddress,
        },
        res: {
          statusCode: c.res.status,
        },
        responseTime,
      });
      if (responseGroup) builder = builder.withGroup(responseGroup);
      builder[responseLogLevel]("request completed");
    }
  });
}
