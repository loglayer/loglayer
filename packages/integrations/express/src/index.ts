import type { ILogLayer } from "loglayer";

declare global {
  namespace Express {
    interface Request {
      log: ILogLayer;
    }
  }
}

export { expressLogLayer, expressLogLayerErrorHandler } from "./plugin.js";
export type {
  ExpressAutoLoggingConfig,
  ExpressGroupConfig,
  ExpressLogLayerConfig,
  ExpressRequestLoggingConfig,
  ExpressResponseLoggingConfig,
} from "./types.js";
