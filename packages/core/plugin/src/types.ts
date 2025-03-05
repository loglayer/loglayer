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

/**
 * Callback function for transforming the data object containing metadata, context, and error information before it's
 * sent to the logging library before it is sent to the transport library.
 *
 * @see {@link https://loglayer.dev/plugins/creating-plugins.html#onbeforedataout | onBeforeDataOut Docs}
 */
export type PluginBeforeDataOutFn = (params: PluginBeforeDataOutParams) => Record<string, any> | null | undefined;

/**
 * Callback function for determining if the message should be sent to the transport library.
 *
 * @see {@link https://loglayer.dev/plugins/creating-plugins.html#shouldsendtologger | shouldSendToLogger Docs}
 */
export type PluginShouldSendToLoggerFn = (params: PluginShouldSendToLoggerParams, loglayer: ILogLayer) => boolean;

/**
 * Callback function for transforming the message data before it is sent to the transport library.
 *
 * @see {@link https://loglayer.dev/plugins/creating-plugins.html#onbeforemessageout | onBeforeMessageOut Docs}
 */
export type PluginBeforeMessageOutFn = (params: PluginBeforeMessageOutParams, loglayer: ILogLayer) => any[];

/**
 * Callback function for when `withMetadata()` or `metadataOnly()` is called.
 *
 * @see {@link https://loglayer.dev/plugins/creating-plugins.html#onmetadatacalled | onMetadataCalled Docs}
 */
export type PluginOnMetadataCalledFn = (
  metadata: Record<string, any>,
  loglayer: ILogLayer,
) => Record<string, any> | null | undefined;

/**
 * Callback function for when `withContext()` is called
 *
 * @see {@link https://loglayer.dev/plugins/creating-plugins.html#oncontextcalled | onContextCalled Docs}
 */
export type PluginOnContextCalledFn = (
  context: Record<string, any>,
  loglayer: ILogLayer,
) => Record<string, any> | null | undefined;

/**
 * List of plugin callbacks that can be called by the plugin manager.
 *
 * @see {@link https://loglayer.dev/plugins/creating-plugins.html#onbeforedataout | onBeforeDataOut Docs}
 * @see {@link https://loglayer.dev/plugins/creating-plugins.html#shouldsendtologger | shouldSendToLogger Docs}
 * @see {@link https://loglayer.dev/plugins/creating-plugins.html#onmetadatacalled | onMetadataCalled Docs}
 * @see {@link https://loglayer.dev/plugins/creating-plugins.html#onbeforemessageout | onBeforeMessageOut Docs}
 * @see {@link https://loglayer.dev/plugins/creating-plugins.html#oncontextcalled | onContextCalled Docs}
 */
export enum PluginCallbackType {
  onBeforeDataOut = "onBeforeDataOut",
  shouldSendToLogger = "shouldSendToLogger",
  onMetadataCalled = "onMetadataCalled",
  onBeforeMessageOut = "onBeforeMessageOut",
  onContextCalled = "onContextCalled",
}
