import type { ILogLayer } from "loglayer";

declare module "koa" {
  interface ExtendableContext {
    log: ILogLayer;
  }
}

export { koaLogLayer } from "./plugin.js";
export type {
  KoaAutoLoggingConfig,
  KoaGroupConfig,
  KoaLogLayerConfig,
  KoaRequestLoggingConfig,
  KoaResponseLoggingConfig,
} from "./types.js";
