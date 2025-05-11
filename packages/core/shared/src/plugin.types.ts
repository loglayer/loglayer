import type { LogLevelType } from "./common.types.js";
import type { ILogLayer } from "./loglayer.types.js";

/**
 * Input for the `onBeforeDataOut` plugin lifecycle method.
 * @see {@link https://loglayer.dev/plugins/creating-plugins.html#onbeforedataout | Creating Plugins}
 */
export interface PluginBeforeDataOutParams {
  /**
   * Log level of the data
   */
  logLevel: LogLevelType;
  /**
   * The object containing metadata / context / error data. This
   * is `undefined` if there is no object with data.
   */
  data?: Record<string, any>;
}

/**
 * Input for the `shouldSendToLogger` plugin lifecycle method.
 * @see {@link https://loglayer.dev/plugins/creating-plugins.html#shouldsendtologger | Creating Plugins}
 */
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
  logLevel: LogLevelType;
  /**
   * The object containing metadata / context / error data. This
   * is `undefined` if there is no object with data.
   */
  data?: Record<string, any>;
}

/**
 * Input for the `onBeforeMessageOut` plugin lifecycle method.
 * @see {@link https://loglayer.dev/plugins/creating-plugins.html#onbeforemessageout | Creating Plugins}
 */
export interface PluginBeforeMessageOutParams {
  /**
   * Log level of the message
   */
  logLevel: LogLevelType;
  /**
   * Message data that is copied from the original.
   */
  messages: any[];
}

/**
 * Parameters for creating a LogLayer plugin.
 * @see {@link https://loglayer.dev/plugins/creating-plugins.html | Creating Plugins}
 */
export interface LogLayerPluginParams {
  /**
   * Unique identifier for the plugin. Used for selectively disabling / enabling
   * and removing the plugin. If not defined, a randomly generated ID will be used.
   */
  id?: string;
  /**
   * If true, the plugin will skip execution
   */
  disabled?: boolean;
}

/**
 * Interface for implementing a LogLayer plugin.
 * @see {@link https://loglayer.dev/plugins/creating-plugins.html | Creating Plugins}
 */
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
   *
   * @see {@link https://loglayer.dev/plugins/creating-plugins.html#onbeforedataout | Creating Plugins}
   */
  onBeforeDataOut?(params: PluginBeforeDataOutParams, loglayer: ILogLayer): Record<string, any> | null | undefined;

  /**
   * Called after `onBeforeDataOut` and before `shouldSendToLogger`.
   * This allows you to modify the message data before it is sent to the destination logging library.
   *
   * @returns [Array] The message data to be sent to the destination logging library.
   *
   * @see {@link https://loglayer.dev/plugins/creating-plugins.html#onbeforemessageout | Creating Plugins}
   */
  onBeforeMessageOut?(params: PluginBeforeMessageOutParams, loglayer: ILogLayer): any[];

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
   *
   * @see {@link https://loglayer.dev/plugins/creating-plugins.html#shouldsendtologger | Creating Plugins}
   */
  shouldSendToLogger?(params: PluginShouldSendToLoggerParams, loglayer: ILogLayer): boolean;

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
   *
   * @see {@link https://loglayer.dev/plugins/creating-plugins.html#onmetadatacalled | Creating Plugins}
   */
  onMetadataCalled?: (metadata: Record<string, any>, loglayer: ILogLayer) => Record<string, any> | null | undefined;

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
   *
   * @see {@link https://loglayer.dev/plugins/creating-plugins.html#oncontextcalled | Creating Plugins}
   */
  onContextCalled?: (context: Record<string, any>, loglayer: ILogLayer) => Record<string, any> | null | undefined;
}
