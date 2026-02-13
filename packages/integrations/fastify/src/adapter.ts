import type { FastifyBaseLogger } from "fastify";
import type { ILogLayer } from "loglayer";

/**
 * Creates a Fastify-compatible logger that wraps a LogLayer instance.
 *
 * Use this with Fastify's `loggerInstance` option to set `fastify.log`
 * to your LogLayer instance. Combine with the `fastifyLogLayer` plugin
 * for request-scoped logging, auto-logging, and error handling.
 *
 * @example
 * ```typescript
 * import Fastify from "fastify";
 * import { LogLayer } from "loglayer";
 * import { createLogLayerFastifyLogger, fastifyLogLayer } from "@loglayer/fastify";
 *
 * const log = new LogLayer({ transport: ... });
 *
 * const app = Fastify({
 *   loggerInstance: createLogLayerFastifyLogger(log),
 * });
 *
 * // Register the plugin for request-scoped logging, auto-logging, etc.
 * await app.register(fastifyLogLayer, { instance: log });
 * ```
 */
export function createLogLayerFastifyLogger(instance: ILogLayer): FastifyBaseLogger {
  return new Proxy(instance as any, {
    get(target, prop, receiver) {
      // Pino-required: level property
      if (prop === "level") {
        return "info";
      }

      // Pino-required: silent method (no-op)
      if (prop === "silent") {
        return () => {};
      }

      // Pino-compatible: child(bindings, options?) → new adapter wrapping child LogLayer
      if (prop === "child") {
        return (bindings?: Record<string, unknown>, _options?: Record<string, unknown>) => {
          const childInstance = target.child() as ILogLayer;
          if (bindings && Object.keys(bindings).length > 0) {
            childInstance.withContext(bindings as Record<string, any>);
          }
          return createLogLayerFastifyLogger(childInstance);
        };
      }

      // For log methods, wrap to handle both Pino-style and LogLayer-style calls:
      // - Pino-style: info({key: val}, "message") → withMetadata(obj).info(msg)
      // - LogLayer-style: info("message") → info(msg)
      if (
        prop === "info" ||
        prop === "error" ||
        prop === "warn" ||
        prop === "debug" ||
        prop === "trace" ||
        prop === "fatal"
      ) {
        const method = prop as string;
        return (...args: any[]) => {
          if (args.length > 0 && typeof args[0] === "object" && args[0] !== null) {
            // Pino-style: first arg is metadata object, second is message
            const msg = typeof args[1] === "string" ? args[1] : "";
            target.withMetadata(args[0])[method](msg);
          } else {
            // LogLayer-style: first arg is message string
            target[method](...args);
          }
        };
      }

      // Everything else delegates to the LogLayer instance
      const value = Reflect.get(target, prop, receiver);
      if (typeof value === "function") {
        return value.bind(target);
      }
      return value;
    },
  }) as unknown as FastifyBaseLogger;
}
