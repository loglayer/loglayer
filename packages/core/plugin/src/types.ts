import type { ILogLayer } from "@loglayer/shared";
import type {
  PluginBeforeDataOutParams,
  PluginBeforeMessageOutParams,
  PluginShouldSendToLoggerParams,
} from "@loglayer/shared";

export type {
  PluginBeforeDataOutParams,
  PluginBeforeMessageOutParams,
  PluginShouldSendToLoggerParams,
  LogLayerPluginParams,
  LogLayerPlugin,
} from "@loglayer/shared";

export type { LogLevel, ILogLayer } from "@loglayer/shared";

export type PluginBeforeDataOutFn = (params: PluginBeforeDataOutParams) => Record<string, any> | null | undefined;

export type PluginShouldSendToLoggerFn = (params: PluginShouldSendToLoggerParams, loglayer: ILogLayer) => boolean;

export type PluginBeforeMessageOutFn = (params: PluginBeforeMessageOutParams, loglayer: ILogLayer) => any[];

export type PluginOnMetadataCalledFn = (
  metadata: Record<string, any>,
  loglayer: ILogLayer,
) => Record<string, any> | null | undefined;

export type PluginOnContextCalledFn = (
  context: Record<string, any>,
  loglayer: ILogLayer,
) => Record<string, any> | null | undefined;

/**
 * List of plugin callbacks that can be called by the plugin manager.
 */
export enum PluginCallbackType {
  onBeforeDataOut = "onBeforeDataOut",
  shouldSendToLogger = "shouldSendToLogger",
  onMetadataCalled = "onMetadataCalled",
  onBeforeMessageOut = "onBeforeMessageOut",
  onContextCalled = "onContextCalled",
}
