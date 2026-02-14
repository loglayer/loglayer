import type { ILogLayer } from "loglayer";

// Module augmentation: adds LogLayer methods to Fastify's logger type.
// Active when anything from @loglayer/fastify is imported.
declare module "fastify" {
  interface FastifyBaseLogger extends ILogLayer {}
}

export { createLogLayerFastifyLogger } from "./adapter.js";
export { fastifyLogLayer } from "./plugin.js";
export type {
  FastifyAutoLoggingConfig,
  FastifyGroupConfig,
  FastifyLogLayerConfig,
  FastifyRequestLoggingConfig,
  FastifyResponseLoggingConfig,
} from "./types.js";
