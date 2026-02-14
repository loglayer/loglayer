import type Koa from "koa";
import type { ILogLayer } from "loglayer";
import type {
  KoaAutoLoggingConfig,
  KoaLogLayerConfig,
  KoaRequestLoggingConfig,
  KoaResponseLoggingConfig,
} from "./types.js";

function resolveGroupConfig(group: KoaLogLayerConfig["group"]) {
  if (!group) return { nameGroup: undefined, requestGroup: undefined, responseGroup: undefined };
  if (group === true) return { nameGroup: "koa", requestGroup: "koa.request", responseGroup: "koa.response" };
  return {
    nameGroup: group.name ?? "koa",
    requestGroup: group.request ?? "koa.request",
    responseGroup: group.response ?? "koa.response",
  };
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

function getRequestId(ctx: Koa.Context, requestIdConfig: KoaLogLayerConfig["requestId"]): string | undefined {
  if (requestIdConfig === false) return undefined;
  if (typeof requestIdConfig === "function") return requestIdConfig(ctx);
  return crypto.randomUUID();
}

function resolveLoggingConfig<T>(value: boolean | T | undefined, defaultEnabled: boolean): T | false {
  if (value === undefined) return defaultEnabled ? ({} as T) : false;
  if (value === true) return {} as T;
  if (value === false) return false;
  return value;
}

/**
 * Creates a Koa middleware that integrates LogLayer for request-scoped logging.
 *
 * The middleware attaches a child LogLayer instance to `ctx.log` for each request.
 * Errors thrown in downstream middleware are automatically logged and re-thrown.
 *
 * @example
 * ```typescript
 * import Koa from "koa";
 * import { LogLayer, ConsoleTransport } from "loglayer";
 * import { koaLogLayer } from "@loglayer/koa";
 *
 * const log = new LogLayer({ transport: new ConsoleTransport() });
 *
 * const app = new Koa();
 * app.use(koaLogLayer({ instance: log }));
 *
 * app.use((ctx) => {
 *   ctx.log.info("Hello from route!");
 *   ctx.body = "Hello World!";
 * });
 * ```
 */
export function koaLogLayer(config: KoaLogLayerConfig): Koa.Middleware {
  const {
    instance,
    requestId: requestIdConfig = true,
    autoLogging: autoLoggingConfig = true,
    contextFn,
    group: groupConfig,
  } = config;
  const { nameGroup, requestGroup, responseGroup } = resolveGroupConfig(groupConfig);

  const autoLogging: KoaAutoLoggingConfig | false =
    autoLoggingConfig === true ? {} : autoLoggingConfig === false ? false : autoLoggingConfig;

  // Resolve auto-logging configs once
  const requestConfig = autoLogging ? resolveLoggingConfig<KoaRequestLoggingConfig>(autoLogging.request, true) : false;
  const responseConfig = autoLogging
    ? resolveLoggingConfig<KoaResponseLoggingConfig>(autoLogging.response, true)
    : false;

  const defaultLogLevel = autoLogging ? (autoLogging.logLevel ?? "info") : "info";
  const requestLogLevel = requestConfig ? (requestConfig.logLevel ?? defaultLogLevel) : defaultLogLevel;
  const responseLogLevel = responseConfig ? (responseConfig.logLevel ?? defaultLogLevel) : defaultLogLevel;

  return async (ctx: Koa.Context, next: Koa.Next) => {
    const context: Record<string, any> = {};

    const reqId = getRequestId(ctx, requestIdConfig);
    if (reqId) {
      context.requestId = reqId;
    }

    if (contextFn) {
      const additionalContext = contextFn(ctx);
      if (additionalContext) {
        Object.assign(context, additionalContext);
      }
    }

    // Create child logger and attach to ctx.log
    const childLogger = instance.child().withContext(context) as ILogLayer;
    ctx.log = childLogger;

    const startTime = Date.now();
    const ignorePath = autoLogging ? shouldIgnorePath(ctx.path, autoLogging.ignore) : true;

    // Log incoming request
    if (requestConfig && !ignorePath) {
      let builder = childLogger.withMetadata({
        req: {
          method: ctx.method,
          url: ctx.url,
          remoteAddress: ctx.ip,
        },
      });
      if (requestGroup) builder = builder.withGroup(requestGroup);
      builder[requestLogLevel]("incoming request");
    }

    try {
      await next();
    } catch (err) {
      // Log error and re-throw
      if (childLogger) {
        let builder = childLogger.withError(err as Error).withMetadata({ url: ctx.url });
        if (nameGroup) builder = builder.withGroup(nameGroup);
        builder.error("Request error");
      }
      throw err;
    }

    // Log response after downstream middleware completes
    if (responseConfig && !ignorePath) {
      const responseTime = Date.now() - startTime;

      let builder = childLogger.withMetadata({
        req: {
          method: ctx.method,
          url: ctx.url,
          remoteAddress: ctx.ip,
        },
        res: {
          statusCode: ctx.status,
        },
        responseTime,
      });
      if (responseGroup) builder = builder.withGroup(responseGroup);
      builder[responseLogLevel]("request completed");
    }
  };
}
