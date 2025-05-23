export { LogLayer } from "./LogLayer.js";
export { MockLogLayer } from "./MockLogLayer.js";
export { MockLogBuilder } from "./MockLogBuilder.js";
export * from "./types/index.js";
export { ConsoleTransport } from "./transports/ConsoleTransport.js";
export { TestLoggingLibrary } from "./TestLoggingLibrary.js";
export { TestTransport } from "./transports/TestTransport.js";

export type {
  PluginBeforeDataOutFn,
  PluginShouldSendToLoggerFn,
  PluginBeforeMessageOutFn,
  PluginOnMetadataCalledFn,
  PluginOnContextCalledFn,
} from "@loglayer/plugin";

export { PluginCallbackType } from "@loglayer/plugin";

export type {
  LogLevelType,
  ErrorOnlyOpts,
  ILogLayer,
  ILogBuilder,
  LogLayerTransport,
} from "@loglayer/shared";

export { LogLevel } from "@loglayer/shared";
