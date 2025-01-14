import type { LogLevel } from "@loglayer/shared";

export interface PluginBeforeDataOutParams {
  /**
   * Log level of the data
   */
  logLevel: LogLevel;
  /**
   * The object containing metadata / context / error data. This
   * is `undefined` if there is no object with data.
   */
  data?: Record<string, any>;
}

export type PluginBeforeDataOutFn = (params: PluginBeforeDataOutParams) => Record<string, any> | null | undefined;

export interface PluginShouldSendToLoggerParams {
  /**
   * Unique identifier for the transport. Can be used to not send to a specific transport.
   */
  transportId?: string;
  /**
   * Message data that is copied from the original.
   */
  messages: any[];
  /**
   * Log level of the message
   */
  logLevel: LogLevel;
  /**
   * The object containing metadata / context / error data. This
   * is `undefined` if there is no object with data.
   */
  data?: Record<string, any>;
}

export type PluginShouldSendToLoggerFn = (params: PluginShouldSendToLoggerParams) => boolean;

export interface PluginBeforeMessageOutParams {
  /**
   * Log level of the message
   */
  logLevel: LogLevel;
  /**
   * Message data that is copied from the original.
   */
  messages: any[];
}

export type PluginBeforeMessageOutFn = (params: PluginBeforeMessageOutParams) => any[];

export type PluginOnMetadataCalledFn = (metadata: Record<string, any>) => Record<string, any> | null | undefined;

export type PluginOnContextCalledFn = (context: Record<string, any>) => Record<string, any> | null | undefined;

export interface LogLayerPluginParams {
  /**
   * Unique identifier for the plugin. Used for selectively disabling / enabling
   * and removing the plugin.
   */
  id?: string;
  /**
   * If true, the plugin will skip execution
   */
  disabled?: boolean;
}

export interface LogLayerPlugin extends LogLayerPluginParams {
  /**
   * Called after the assembly of the data object that contains
   * the metadata / context / error data before being sent to the destination logging
   * library.
   *
   * - The shape of `data` varies depending on your `fieldName` configuration
   * for metadata / context / error. The metadata / context / error data is a *shallow* clone.
   * - If data was not found for assembly, `undefined` is used as the `data` input.
   * - You can also create your own object and return it to be sent to the logging library.
   *
   * @returns [Object] The object to be sent to the destination logging
   * library or null / undefined to not pass an object through.
   */
  onBeforeDataOut?(params: PluginBeforeDataOutParams): Record<string, any> | null | undefined;

  /**
   * Called after `onBeforeDataOut` and before `shouldSendToLogger`.
   * This allows you to modify the message data before it is sent to the destination logging library.
   *
   * @returns [Array] The message data to be sent to the destination logging library.
   */
  onBeforeMessageOut?(params: PluginBeforeMessageOutParams): any[];

  /**
   * Called before the data is sent to the transport. Return false to omit sending
   * to the transport. Useful for isolating specific log messages for debugging /
   * troubleshooting.
   *
   * If there are multiple plugins with shouldSendToLogger defined, the
   * first plugin to return false will stop the data from being sent to the
   * transport.
   *
   * @returns boolean If true, sends data to the transport, if false does not.
   */
  shouldSendToLogger?(params: PluginShouldSendToLoggerParams): boolean;

  /**
   * Called when withMetadata() or metadataOnly() is called. This allows you to modify the metadata before it is sent to the destination logging library.
   *
   * The metadata is a *shallow* clone of the metadata input.
   *
   * If null is returned, then no metadata will be sent to the destination logging library.
   *
   * In multiple plugins, the modified metadata will be passed through each plugin in the order they are added.
   *
   * @returns [Object] The metadata object to be sent to the destination logging library.
   */
  onMetadataCalled?: (metadata: Record<string, any>) => Record<string, any> | null | undefined;

  /**
   * Called when withContext() is called. This allows you to modify the context before it is used.
   *
   * The context is a *shallow* clone of the context input.
   *
   * If null is returned, then no context will be used.
   *
   * In multiple plugins, the modified context will be passed through each plugin in the order they are added.
   *
   * @returns [Object] The context object to be used.
   */
  onContextCalled?: (context: Record<string, any>) => Record<string, any> | null | undefined;
}

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
