/**
 * @loglayer/transport-central
 *
 * LogLayer transport for sending logs to the Central log aggregation server.
 *
 * @example
 * ```typescript
 * import { LogLayer } from "loglayer";
 * import { LogLayerCentralTransport } from "@loglayer/transport-central";
 *
 * const log = new LogLayer({
 *   transport: new LogLayerCentralTransport({
 *     baseUrl: "http://localhost:9800",
 *     service: "my-app",
 *   }),
 * });
 *
 * log.info("Hello from Central!");
 * ```
 *
 * @module
 */

export {
  DEFAULT_BASE_URL,
  DEFAULT_PORT,
  LogLayerCentralTransport,
  type LogLayerCentralTransportConfig,
} from "./LogLayerCentralTransport.js";
