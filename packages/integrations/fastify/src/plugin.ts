import type { FastifyPluginAsync, FastifyRequest } from "fastify";
import fastifyPlugin from "fastify-plugin";
import type { ILogLayer } from "loglayer";
import { createLogLayerFastifyLogger } from "./adapter.js";
import type {
  FastifyAutoLoggingConfig,
  FastifyLogLayerConfig,
  FastifyRequestLoggingConfig,
  FastifyResponseLoggingConfig,
} from "./types.js";

function resolveGroupConfig(group: FastifyLogLayerConfig["group"]) {
  if (!group) return { nameGroup: undefined, requestGroup: undefined, responseGroup: undefined };
  if (group === true)
    return { nameGroup: "fastify", requestGroup: "fastify.request", responseGroup: "fastify.response" };
  return {
    nameGroup: group.name ?? "fastify",
    requestGroup: group.request ?? "fastify.request",
    responseGroup: group.response ?? "fastify.response",
  };
}

// WeakMap to store per-request start times without decorating the request
const requestStartTimes = new WeakMap<FastifyRequest, number>();

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

function getRequestId(
  request: FastifyRequest,
  requestIdConfig: FastifyLogLayerConfig["requestId"],
): string | undefined {
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

const fastifyLogLayerPlugin: FastifyPluginAsync<FastifyLogLayerConfig> = async (fastify, config) => {
  const {
    instance,
    requestId: requestIdConfig = true,
    autoLogging: autoLoggingConfig = true,
    contextFn,
    group: groupConfig,
  } = config;
  const { nameGroup, requestGroup, responseGroup } = resolveGroupConfig(groupConfig);

  const autoLogging: FastifyAutoLoggingConfig | false =
    autoLoggingConfig === true ? {} : autoLoggingConfig === false ? false : autoLoggingConfig;

  // Resolve auto-logging configs once
  const requestConfig = autoLogging
    ? resolveLoggingConfig<FastifyRequestLoggingConfig>(autoLogging.request, true)
    : false;
  const responseConfig = autoLogging
    ? resolveLoggingConfig<FastifyResponseLoggingConfig>(autoLogging.response, true)
    : false;

  const defaultLogLevel = autoLogging ? (autoLogging.logLevel ?? "info") : "info";
  const requestLogLevel = requestConfig ? (requestConfig.logLevel ?? defaultLogLevel) : defaultLogLevel;
  const responseLogLevel = responseConfig ? (responseConfig.logLevel ?? defaultLogLevel) : defaultLogLevel;

  // onRequest: create child logger, assign to request.log, and optionally log incoming request
  fastify.addHook("onRequest", async (request) => {
    const context: Record<string, any> = {};

    const reqId = getRequestId(request, requestIdConfig);
    if (reqId) {
      context.requestId = reqId;
    }

    if (contextFn) {
      const additionalContext = contextFn(request);
      if (additionalContext) {
        Object.assign(context, additionalContext);
      }
    }

    // Create a child LogLayer, apply context, and wrap in the Fastify adapter
    const childLogger = instance.child().withContext(context) as ILogLayer;
    (request as any).log = createLogLayerFastifyLogger(childLogger);
    requestStartTimes.set(request, Date.now());

    if (requestConfig && !shouldIgnorePath(request.url, autoLogging ? autoLogging.ignore : undefined)) {
      let builder = request.log.withMetadata({
        req: {
          method: request.method,
          url: request.url,
          remoteAddress: request.ip,
        },
      });
      if (requestGroup) builder = builder.withGroup(requestGroup);
      builder[requestLogLevel]("incoming request");
    }
  });

  // onResponse: log request completed
  if (responseConfig) {
    fastify.addHook("onResponse", async (request, reply) => {
      if (!request.log) return;
      if (autoLogging && shouldIgnorePath(request.url, autoLogging.ignore)) return;

      const startTime = requestStartTimes.get(request) ?? Date.now();
      const responseTime = Date.now() - startTime;

      let builder = request.log.withMetadata({
        req: {
          method: request.method,
          url: request.url,
          remoteAddress: request.ip,
        },
        res: {
          statusCode: reply.statusCode,
        },
        responseTime,
      });
      if (responseGroup) builder = builder.withGroup(responseGroup);
      builder[responseLogLevel]("request completed");
    });
  }

  // onError: log errors
  fastify.addHook("onError", async (request, _reply, error) => {
    if (!request.log) return;
    let builder = request.log.withError(error).withMetadata({ url: request.url });
    if (nameGroup) builder = builder.withGroup(nameGroup);
    builder.error("Request error");
  });
};

/**
 * Fastify plugin that integrates LogLayer for request-scoped logging.
 *
 * @example
 * ```typescript
 * import Fastify from "fastify";
 * import { LogLayer, ConsoleTransport } from "loglayer";
 * import { fastifyLogLayer } from "@loglayer/fastify";
 *
 * const log = new LogLayer({ transport: new ConsoleTransport() });
 *
 * const app = Fastify();
 * await app.register(fastifyLogLayer, { instance: log });
 *
 * app.get("/", (request, reply) => {
 *   request.log.info("Hello from route!");
 *   reply.send("Hello World!");
 * });
 * ```
 */
export const fastifyLogLayer = fastifyPlugin(fastifyLogLayerPlugin, {
  fastify: ">=5.0.0",
  name: "@loglayer/fastify",
});
