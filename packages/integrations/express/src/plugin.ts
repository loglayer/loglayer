import type { ErrorRequestHandler, NextFunction, Request, Response } from "express";
import type { ILogLayer } from "loglayer";
import type {
  ExpressAutoLoggingConfig,
  ExpressLogLayerConfig,
  ExpressRequestLoggingConfig,
  ExpressResponseLoggingConfig,
} from "./types.js";

function resolveGroupConfig(group: ExpressLogLayerConfig["group"]) {
  if (!group) return { nameGroup: undefined, requestGroup: undefined, responseGroup: undefined };
  if (group === true)
    return { nameGroup: "express", requestGroup: "express.request", responseGroup: "express.response" };
  return {
    nameGroup: group.name ?? "express",
    requestGroup: group.request ?? "express.request",
    responseGroup: group.response ?? "express.response",
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

function getRequestId(request: Request, requestIdConfig: ExpressLogLayerConfig["requestId"]): string | undefined {
  if (requestIdConfig === false) return undefined;
  if (typeof requestIdConfig === "function") return requestIdConfig(request);
  return crypto.randomUUID();
}

function resolveLoggingConfig<T>(value: boolean | T | undefined, defaultEnabled: boolean): T | false {
  if (value === undefined) return defaultEnabled ? ({} as T) : false;
  if (value === true) return {} as T;
  if (value === false) return false;
  return value;
}

/**
 * Creates an Express middleware that integrates LogLayer for request-scoped logging.
 *
 * The middleware attaches a child LogLayer instance to `req.log` for each request.
 *
 * @example
 * ```typescript
 * import express from "express";
 * import { LogLayer, ConsoleTransport } from "loglayer";
 * import { expressLogLayer } from "@loglayer/express";
 *
 * const log = new LogLayer({ transport: new ConsoleTransport() });
 *
 * const app = express();
 * app.use(expressLogLayer({ instance: log }));
 *
 * app.get("/", (req, res) => {
 *   req.log.info("Hello from route!");
 *   res.send("Hello World!");
 * });
 * ```
 */
export function expressLogLayer(config: ExpressLogLayerConfig) {
  const {
    instance,
    requestId: requestIdConfig = true,
    autoLogging: autoLoggingConfig = true,
    contextFn,
    group: groupConfig,
  } = config;
  const { requestGroup, responseGroup } = resolveGroupConfig(groupConfig);

  const autoLogging: ExpressAutoLoggingConfig | false =
    autoLoggingConfig === true ? {} : autoLoggingConfig === false ? false : autoLoggingConfig;

  // Resolve auto-logging configs once
  const requestConfig = autoLogging
    ? resolveLoggingConfig<ExpressRequestLoggingConfig>(autoLogging.request, true)
    : false;
  const responseConfig = autoLogging
    ? resolveLoggingConfig<ExpressResponseLoggingConfig>(autoLogging.response, true)
    : false;

  const defaultLogLevel = autoLogging ? (autoLogging.logLevel ?? "info") : "info";
  const requestLogLevel = requestConfig ? (requestConfig.logLevel ?? defaultLogLevel) : defaultLogLevel;
  const responseLogLevel = responseConfig ? (responseConfig.logLevel ?? defaultLogLevel) : defaultLogLevel;

  return (req: Request, res: Response, next: NextFunction) => {
    const context: Record<string, any> = {};

    const reqId = getRequestId(req, requestIdConfig);
    if (reqId) {
      context.requestId = reqId;
    }

    if (contextFn) {
      const additionalContext = contextFn(req);
      if (additionalContext) {
        Object.assign(context, additionalContext);
      }
    }

    // Create child logger and attach to req.log
    const childLogger = instance.child().withContext(context) as ILogLayer;
    (req as any).log = childLogger;

    const startTime = Date.now();
    const ignorePath = autoLogging ? shouldIgnorePath(req.path, autoLogging.ignore) : true;

    // Log incoming request
    if (requestConfig && !ignorePath) {
      let builder = childLogger.withMetadata({
        req: {
          method: req.method,
          url: req.originalUrl || req.url,
          remoteAddress: req.ip,
        },
      });
      if (requestGroup) builder = builder.withGroup(requestGroup);
      builder[requestLogLevel]("incoming request");
    }

    // Log response on completion (listen on close, finish, and error for reliability)
    if (responseConfig && !ignorePath) {
      const onResponseComplete = () => {
        res.removeListener("close", onResponseComplete);
        res.removeListener("finish", onResponseComplete);
        res.removeListener("error", onResponseComplete);

        const responseTime = Date.now() - startTime;
        let builder = childLogger.withMetadata({
          req: {
            method: req.method,
            url: req.originalUrl || req.url,
            remoteAddress: req.ip,
          },
          res: {
            statusCode: res.statusCode,
          },
          responseTime,
        });
        if (responseGroup) builder = builder.withGroup(responseGroup);
        builder[responseLogLevel]("request completed");
      };

      res.on("close", onResponseComplete);
      res.on("finish", onResponseComplete);
      res.on("error", onResponseComplete);
    }

    next();
  };
}

/**
 * Creates an Express error-handling middleware that logs errors via LogLayer.
 *
 * This middleware should be registered after all routes. It logs the error
 * using `req.log` (set by `expressLogLayer`) and passes the error to the
 * next error handler via `next(err)`.
 *
 * @example
 * ```typescript
 * import express from "express";
 * import { expressLogLayer, expressLogLayerErrorHandler } from "@loglayer/express";
 *
 * const app = express();
 * app.use(expressLogLayer({ instance: log }));
 *
 * // ... routes ...
 *
 * app.use(expressLogLayerErrorHandler());
 * app.use((err, req, res, next) => {
 *   res.status(500).send("Internal Server Error");
 * });
 * ```
 */
export function expressLogLayerErrorHandler(config?: { group?: ExpressLogLayerConfig["group"] }): ErrorRequestHandler {
  const { nameGroup } = resolveGroupConfig(config?.group);

  return (err: Error, req: Request, _res: Response, next: NextFunction) => {
    if ((req as any).log) {
      let builder = ((req as any).log as ILogLayer).withError(err).withMetadata({ url: req.originalUrl || req.url });
      if (nameGroup) builder = builder.withGroup(nameGroup);
      builder.error("Request error");
    }
    next(err);
  };
}
