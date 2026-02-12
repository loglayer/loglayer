import type { ILogLayer } from "@loglayer/shared";
import { Elysia } from "elysia";
import type {
  ElysiaAutoLoggingConfig,
  ElysiaLogLayerConfig,
  ElysiaRequestLoggingConfig,
  ElysiaResponseLoggingConfig,
} from "./types.js";

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

function getRequestId(request: Request, requestIdConfig: ElysiaLogLayerConfig["requestId"]): string | undefined {
  if (requestIdConfig === false) return undefined;
  if (typeof requestIdConfig === "function") return requestIdConfig(request);
  return crypto.randomUUID();
}

function getRemoteAddress(request: Request, server?: any): string | undefined {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  // Try Bun's server.requestIP (available in Bun runtime)
  if (server?.requestIP) {
    try {
      return server.requestIP(request)?.address;
    } catch {
      // Not available in this runtime
    }
  }

  // Try Node.js adapter's request.ip (available via @elysiajs/node)
  if ((request as any).ip) {
    return (request as any).ip;
  }

  return undefined;
}

function resolveLoggingConfig<T>(value: boolean | T | undefined, defaultEnabled: boolean): T | false {
  if (value === undefined) return defaultEnabled ? ({} as T) : false;
  if (value === true) return {} as T;
  if (value === false) return false;
  return value;
}

/**
 * Creates an ElysiaJS plugin that integrates LogLayer for request-scoped logging.
 *
 * @example
 * ```typescript
 * import { Elysia } from "elysia";
 * import { LogLayer, ConsoleTransport } from "loglayer";
 * import { elysiaLogLayer } from "@loglayer/elysia";
 *
 * const log = new LogLayer({ transport: new ConsoleTransport() });
 *
 * const app = new Elysia()
 *   .use(elysiaLogLayer({ instance: log }))
 *   .get("/", ({ log }) => {
 *     log.info("Hello from route!");
 *     return "Hello World!";
 *   })
 *   .listen(3000);
 * ```
 */
export function elysiaLogLayer(config: ElysiaLogLayerConfig) {
  const { instance, requestId: requestIdConfig = true, autoLogging: autoLoggingConfig = true, contextFn } = config;

  const autoLogging: ElysiaAutoLoggingConfig | false =
    autoLoggingConfig === true ? {} : autoLoggingConfig === false ? false : autoLoggingConfig;

  if (!autoLogging) {
    return new Elysia({ name: "@loglayer/elysia", seed: config })
      .derive({ as: "global" }, ({ request, path }) => {
        return deriveLogger(instance, request, path, requestIdConfig, contextFn);
      })
      .onError({ as: "global" }, ({ log, error, path }) => {
        if (!log) return;
        (log as ILogLayer).withError(error).withMetadata({ url: path }).error("Request error");
      });
  }

  const defaultLogLevel = autoLogging.logLevel ?? "info";

  const requestConfig = resolveLoggingConfig<ElysiaRequestLoggingConfig>(autoLogging.request, true);
  const responseConfig = resolveLoggingConfig<ElysiaResponseLoggingConfig>(autoLogging.response, true);

  const requestLogLevel = requestConfig ? (requestConfig.logLevel ?? defaultLogLevel) : defaultLogLevel;
  const responseLogLevel = responseConfig ? (responseConfig.logLevel ?? defaultLogLevel) : defaultLogLevel;

  const plugin = new Elysia({ name: "@loglayer/elysia", seed: config })
    .derive({ as: "global" }, ({ request, path, server }) => {
      return {
        ...deriveLogger(instance, request, path, requestIdConfig, contextFn),
        _remoteAddress: getRemoteAddress(request, server),
      };
    })
    .onError({ as: "global" }, ({ log, error, path }) => {
      if (!log) return;
      (log as ILogLayer).withError(error).withMetadata({ url: path }).error("Request error");
    });

  if (requestConfig) {
    plugin.onBeforeHandle({ as: "global" }, ({ log, request, path, _remoteAddress }) => {
      if (shouldIgnorePath(path, autoLogging.ignore)) return;

      (log as ILogLayer)
        .withMetadata({
          req: {
            method: request.method,
            url: path,
            remoteAddress: _remoteAddress,
          },
        })
        [requestLogLevel]("incoming request");
    });
  }

  if (responseConfig) {
    plugin.onAfterHandle({ as: "global" }, ({ log, request, path, _requestStartTime, _remoteAddress, set }) => {
      if (shouldIgnorePath(path, autoLogging.ignore)) return;

      const responseTime = Date.now() - (_requestStartTime as number);
      const statusCode = set.status ?? 200;

      (log as ILogLayer)
        .withMetadata({
          req: {
            method: request.method,
            url: path,
            remoteAddress: _remoteAddress,
          },
          res: {
            statusCode,
          },
          responseTime,
        })
        [responseLogLevel]("request completed");
    });
  }

  return plugin;
}

function deriveLogger(
  instance: ILogLayer,
  request: Request,
  path: string,
  requestIdConfig: ElysiaLogLayerConfig["requestId"],
  contextFn: ElysiaLogLayerConfig["contextFn"],
) {
  const context: Record<string, any> = {
    requestId: getRequestId(request, requestIdConfig),
  };

  // Only include requestId if it was generated
  if (!context.requestId) {
    delete context.requestId;
  }

  if (contextFn) {
    const additionalContext = contextFn({ request, path });
    if (additionalContext) {
      Object.assign(context, additionalContext);
    }
  }

  const childLogger = instance.child().withContext(context);

  return {
    log: childLogger as ILogLayer,
    _requestStartTime: Date.now(),
  };
}
