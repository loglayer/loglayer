import type {
  LogLayerPlugin,
  PluginBeforeDataOutParams,
  PluginBeforeMessageOutParams,
  PluginShouldSendToLoggerParams,
} from "@loglayer/plugin";

import { PluginCallbackType } from "@loglayer/plugin";
import type { ILogLayer, LogLayerData, LogLayerMetadata, MessageDataType } from "@loglayer/shared";

const CALLBACK_LIST = [
  PluginCallbackType.onBeforeDataOut,
  PluginCallbackType.onMetadataCalled,
  PluginCallbackType.shouldSendToLogger,
  PluginCallbackType.onBeforeMessageOut,
  PluginCallbackType.onContextCalled,
];

interface LogLayerPluginWithTimestamp extends LogLayerPlugin {
  registeredAt: number;
}

/**
 * A class that manages plugins and runs their callbacks.
 * Used by LogLayer to run plugins at various stages of the logging process.
 */
export class PluginManager {
  private idToPlugin: Record<string, LogLayerPluginWithTimestamp>;
  // Indexes for each plugin type
  private onBeforeDataOut: Array<string> = [];
  private shouldSendToLogger: Array<string> = [];
  private onMetadataCalled: Array<string> = [];
  private onBeforeMessageOut: Array<string> = [];
  private onContextCalled: Array<string> = [];

  constructor(plugins: Array<LogLayerPlugin>) {
    this.idToPlugin = {};
    this.mapPlugins(plugins);
    this.indexPlugins();
  }

  private mapPlugins(plugins: Array<LogLayerPlugin>) {
    for (const plugin of plugins) {
      if (!plugin.id) {
        plugin.id = Date.now().toString() + Math.random().toString();
      }

      if (this.idToPlugin[plugin.id]) {
        throw new Error(`[LogLayer] Plugin with id ${plugin.id} already exists.`);
      }

      plugin["registeredAt"] = Date.now();
      this.idToPlugin[plugin.id] = plugin as LogLayerPluginWithTimestamp;
    }
  }

  private indexPlugins() {
    this.onBeforeDataOut = [];
    this.shouldSendToLogger = [];
    this.onMetadataCalled = [];
    this.onBeforeMessageOut = [];
    this.onContextCalled = [];

    const pluginList = Object.values(this.idToPlugin).sort((a, b) => a.registeredAt - b.registeredAt);

    for (const plugin of pluginList) {
      if (plugin.disabled) {
        return;
      }

      for (const callback of CALLBACK_LIST) {
        // If the callback is defined, add the plugin id to the callback list
        if (plugin[callback] && plugin.id) {
          this[callback].push(plugin.id);
        }
      }
    }
  }

  hasPlugins(callbackType: PluginCallbackType) {
    return this[callbackType].length > 0;
  }

  countPlugins(callbackType?: PluginCallbackType) {
    if (callbackType) {
      return this[callbackType].length;
    }

    return Object.keys(this.idToPlugin).length;
  }

  addPlugins(plugins: Array<LogLayerPlugin>) {
    this.mapPlugins(plugins);
    this.indexPlugins();
  }

  enablePlugin(id: string) {
    const plugin = this.idToPlugin[id];

    if (plugin) {
      plugin.disabled = false;
    }

    this.indexPlugins();
  }

  disablePlugin(id: string) {
    const plugin = this.idToPlugin[id];

    if (plugin) {
      plugin.disabled = true;
    }

    this.indexPlugins();
  }

  removePlugin(id: string) {
    delete this.idToPlugin[id];
    this.indexPlugins();
  }

  /**
   * Runs plugins that defines onBeforeDataOut.
   */
  runOnBeforeDataOut(params: PluginBeforeDataOutParams, loglayer: ILogLayer): LogLayerData | undefined {
    const initialData = { ...params }; // Make a shallow copy of params to avoid direct modification

    for (const pluginId of this.onBeforeDataOut) {
      const plugin = this.idToPlugin[pluginId];

      if (plugin.onBeforeDataOut) {
        const result = plugin.onBeforeDataOut(
          {
            data: initialData.data,
            logLevel: initialData.logLevel,
            error: initialData.error,
            metadata: initialData.metadata,
            context: initialData.context,
          },
          loglayer,
        );

        if (result) {
          if (!initialData.data) {
            initialData.data = {};
          }

          // Mutate initialData.data directly instead of spreading it repeatedly
          Object.assign(initialData.data, result);
        }
      }
    }

    return initialData.data;
  }

  /**
   * Runs plugins that define shouldSendToLogger. Any plugin that returns false will prevent the message from being sent to the transport.
   */
  runShouldSendToLogger(params: PluginShouldSendToLoggerParams, loglayer: ILogLayer) {
    return !this.shouldSendToLogger.some((pluginId) => {
      const plugin = this.idToPlugin[pluginId];

      // Return the negation of 'shouldSendToLogger' because 'some' will stop on true,
      // and we stop on an explicit false return value from 'shouldSendToLogger'.
      return !plugin.shouldSendToLogger?.(params, loglayer);
    });
  }

  /**
   * Runs plugins that define onMetadataCalled.
   */
  runOnMetadataCalled(metadata: LogLayerMetadata, loglayer: ILogLayer): LogLayerMetadata | null {
    // Create a shallow copy of metadata to avoid direct modification
    let data: LogLayerMetadata = {
      ...metadata,
    };

    for (const pluginId of this.onMetadataCalled) {
      const plugin = this.idToPlugin[pluginId];

      const result = plugin.onMetadataCalled?.(data, loglayer);

      if (result) {
        data = result;
      } else {
        return null;
      }
    }

    return data;
  }

  runOnBeforeMessageOut(params: PluginBeforeMessageOutParams, loglayer: ILogLayer): MessageDataType[] {
    let messages = [...params.messages];

    for (const pluginId of this.onBeforeMessageOut) {
      const plugin = this.idToPlugin[pluginId];

      const result = plugin.onBeforeMessageOut?.(
        {
          messages: messages,
          logLevel: params.logLevel,
        },
        loglayer,
      );

      if (result) {
        messages = result;
      }
    }

    return messages;
  }

  /**
   * Runs plugins that define onContextCalled.
   */
  runOnContextCalled(context: Record<string, any>, loglayer: ILogLayer): Record<string, any> | null {
    // Create a shallow copy of context to avoid direct modification
    let data: Record<string, any> = {
      ...context,
    };

    for (const pluginId of this.onContextCalled) {
      const plugin = this.idToPlugin[pluginId];

      const result = plugin.onContextCalled?.(data, loglayer);

      if (result) {
        data = result;
      } else {
        return null;
      }
    }

    return data;
  }
}
