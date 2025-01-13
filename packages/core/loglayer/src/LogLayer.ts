import { LogLevel, type MessageDataType } from "@loglayer/shared";
import { LogBuilder } from "./LogBuilder.js";
import { PluginManager } from "./PluginManager.js";
import type { ErrorOnlyOpts, ILogLayer, LogLayerConfig } from "./types/index.js";

import { type LogLayerPlugin, PluginCallbackType } from "@loglayer/plugin";

interface FormatLogParams {
  logLevel: LogLevel;
  params?: any[];
  metadata?: Record<string, any> | null;
  err?: any;
}

/**
 * Wraps around a logging framework to provide convenience methods that allow
 * developers to programmatically specify their errors and metadata along with
 * a message in a consistent fashion.
 */
export class LogLayer implements ILogLayer {
  private context: Record<string, any>;
  private hasContext: boolean;
  private pluginManager: PluginManager;
  private idToTransport: Record<string, any>;

  _config: LogLayerConfig;

  constructor(config: LogLayerConfig) {
    this.context = {};
    this.hasContext = false;
    this._config = {
      ...config,
      enabled: config.enabled ?? true,
    };

    this.pluginManager = new PluginManager(config.plugins || []);

    if (!this._config.errorFieldName) {
      this._config.errorFieldName = "err";
    }

    if (!this._config.copyMsgOnOnlyError) {
      this._config.copyMsgOnOnlyError = false;
    }

    if (Array.isArray(config.transport)) {
      this.idToTransport = config.transport.reduce((acc, transport) => {
        acc[transport.id] = transport;
        return acc;
      }, {});
    } else {
      this.idToTransport = {
        [config.transport.id]: config.transport,
      };
    }
  }

  /**
   * Calls child() and sets the prefix to be included with every log message.
   */
  withPrefix(prefix: string): LogLayer {
    const logger = this.child();
    logger._config.prefix = prefix;

    return logger;
  }

  /**
   * Appends context data which will be included with
   * every log entry.
   */
  withContext(context: Record<string, any>): LogLayer {
    let updatedContext = context;

    if (this.pluginManager.hasPlugins(PluginCallbackType.onContextCalled)) {
      updatedContext = this.pluginManager.runOnContextCalled(context);

      if (!updatedContext) {
        if (this._config.consoleDebug) {
          console.debug("[LogLayer] Context was dropped due to plugin returning falsy value.");
        }

        return this;
      }
    }

    this.context = {
      ...this.context,
      ...updatedContext,
    };

    this.hasContext = true;

    return this;
  }

  /**
   * Returns the context used
   */
  getContext() {
    return this.context;
  }

  /**
   * Add additional plugins.
   */
  addPlugins(plugins: Array<LogLayerPlugin>) {
    this.pluginManager.addPlugins(plugins);
  }

  /**
   * Enables a plugin by id.
   */
  enablePlugin(id: string) {
    this.pluginManager.enablePlugin(id);
  }

  /**
   * Disables a plugin by id.
   */
  disablePlugin(id: string) {
    this.pluginManager.disablePlugin(id);
  }

  /**
   * Removes a plugin by id.
   */
  removePlugin(id: string) {
    this.pluginManager.removePlugin(id);
  }

  /**
   * Specifies metadata to include with the log message
   */
  withMetadata(metadata: Record<string, any>) {
    return new LogBuilder(this).withMetadata(metadata);
  }

  /**
   * Specifies an Error to include with the log message
   */
  withError(error: any) {
    return new LogBuilder(this).withError(error);
  }

  /**
   * Creates a new instance of LogLayer but with the initialization
   * configuration and context copied over.
   */
  child() {
    if (this.hasContext) {
      return new LogLayer(this._config)
        .withContext({
          ...this.context,
        })
        .withPluginManager(this.pluginManager);
    }

    return new LogLayer(this._config).withPluginManager(this.pluginManager);
  }

  protected withPluginManager(pluginManager: PluginManager) {
    this.pluginManager = pluginManager;
    return this;
  }

  /**
   * Logs only the error object without a log message
   */
  errorOnly(error: any, opts?: ErrorOnlyOpts) {
    const { copyMsgOnOnlyError } = this._config;

    const formatLogConf: FormatLogParams = {
      logLevel: opts?.logLevel || LogLevel.error,
      err: error,
    };

    // Copy the error message as the log message
    if (((copyMsgOnOnlyError && opts?.copyMsg !== false) || opts?.copyMsg === true) && error?.message) {
      formatLogConf.params = [error.message];
    }

    this._formatLog(formatLogConf);
  }

  /**
   * Logs only metadata without a log message
   */
  metadataOnly(metadata: Record<string, any>, logLevel: LogLevel = LogLevel.info) {
    const { muteMetadata, consoleDebug } = this._config;

    if (muteMetadata) {
      return;
    }

    let data: Record<string, any> | null = metadata;

    if (this.pluginManager.hasPlugins(PluginCallbackType.onMetadataCalled)) {
      data = this.pluginManager.runOnMetadataCalled(metadata);

      if (!data) {
        if (consoleDebug) {
          console.debug("[LogLayer] Metadata was dropped due to plugin returning falsy value.");
        }

        return;
      }
    }

    const config: FormatLogParams = {
      logLevel,
      metadata: data,
    };

    this._formatLog(config);
  }

  /**
   * Sends a log message to the logging library under an info log level.
   *
   * The logging library may or may not support multiple message parameters and only
   * the first parameter would be used.
   */
  info(...messages: MessageDataType[]) {
    this._formatMessage(messages);
    this._formatLog({ logLevel: LogLevel.info, params: messages });
  }

  /**
   * Sends a log message to the logging library under the warn log level
   *
   * The logging library may or may not support multiple message parameters and only
   * the first parameter would be used.
   */
  warn(...messages: MessageDataType[]) {
    this._formatMessage(messages);
    this._formatLog({ logLevel: LogLevel.warn, params: messages });
  }

  /**
   * Sends a log message to the logging library under the error log level
   *
   * The logging library may or may not support multiple message parameters and only
   * the first parameter would be used.
   */
  error(...messages: MessageDataType[]) {
    this._formatMessage(messages);
    this._formatLog({ logLevel: LogLevel.error, params: messages });
  }

  /**
   * Sends a log message to the logging library under the debug log level
   *
   * The logging library may or may not support multiple message parameters and only
   * the first parameter would be used.
   */
  debug(...messages: MessageDataType[]) {
    this._formatMessage(messages);
    this._formatLog({ logLevel: LogLevel.debug, params: messages });
  }

  /**
   * Sends a log message to the logging library under the trace log level
   *
   * The logging library may or may not support multiple message parameters and only
   * the first parameter would be used.
   */
  trace(...messages: MessageDataType[]) {
    this._formatMessage(messages);
    this._formatLog({ logLevel: LogLevel.trace, params: messages });
  }

  /**
   * Sends a log message to the logging library under the fatal log level
   *
   * The logging library may or may not support multiple message parameters and only
   * the first parameter would be used.
   */
  fatal(...messages: MessageDataType[]) {
    this._formatMessage(messages);
    this._formatLog({ logLevel: LogLevel.fatal, params: messages });
  }

  /**
   * All logging inputs are dropped and stops sending logs to the logging library.
   */
  disableLogging() {
    this._config.enabled = false;
    return this;
  }

  /**
   * Enable sending logs to the logging library.
   */
  enableLogging() {
    this._config.enabled = true;
    return this;
  }

  /**
   * Disables inclusion of context data in the print
   */
  muteContext(): ILogLayer {
    this._config.muteContext = true;
    return this;
  }

  /**
   * Enables inclusion of context data in the print
   */
  unMuteContext(): ILogLayer {
    this._config.muteContext = false;
    return this;
  }

  /**
   * Disables inclusion of metadata in the print
   */
  muteMetadata(): ILogLayer {
    this._config.muteMetadata = true;
    return this;
  }

  /**
   * Enables inclusion of metadata in the print
   */
  unMuteMetadata(): ILogLayer {
    this._config.muteMetadata = false;
    return this;
  }

  private formatContext() {
    const { contextFieldName, muteContext } = this._config;

    if (this.hasContext && !muteContext) {
      if (contextFieldName) {
        return {
          [contextFieldName]: {
            ...this.context,
          },
        };
      }

      return {
        ...this.context,
      };
    }

    return {};
  }

  private formatMetadata(data: Record<string, any> | null = null) {
    const { metadataFieldName, muteMetadata } = this._config;

    if (data && !muteMetadata) {
      if (metadataFieldName) {
        return {
          [metadataFieldName]: {
            ...data,
          },
        };
      }

      return {
        ...data,
      };
    }

    return {};
  }

  getLoggerInstance<Logger>(id: string): Logger | undefined {
    const transport = this.idToTransport[id];

    if (!transport) {
      return undefined;
    }

    return transport.getLoggerInstance();
  }

  _formatMessage(messages: MessageDataType[] = []) {
    const { prefix } = this._config;

    if (prefix && typeof messages[0] === "string") {
      messages[0] = `${prefix} ${messages[0]}`;
    }
  }

  _formatLog({ logLevel, params = [], metadata = null, err }: FormatLogParams) {
    const {
      enabled,
      errorSerializer,
      errorFieldInMetadata,
      muteContext,
      contextFieldName,
      metadataFieldName,
      errorFieldName,
    } = this._config;

    if (!enabled) {
      return;
    }

    let hasObjData = !!metadata || (muteContext ? false : this.hasContext);

    let d: Record<string, any> | undefined | null = {};

    if (hasObjData) {
      // Field names for context and metadata is the same, merge the metadata into the same field name
      if (contextFieldName && contextFieldName === metadataFieldName) {
        const contextData = this.formatContext()[contextFieldName];
        const updatedMetadata = this.formatMetadata(metadata)[metadataFieldName];

        d = {
          [contextFieldName]: {
            ...contextData,
            ...updatedMetadata,
          },
        };
      } else {
        d = {
          ...this.formatContext(),
          ...this.formatMetadata(metadata),
        };
      }
    }

    if (err) {
      const serializedError = errorSerializer ? errorSerializer(err) : err;

      // The error should be placed into a metadata field
      if (errorFieldInMetadata && metadata) {
        metadata[errorFieldName] = serializedError;
      } else if (errorFieldInMetadata && !metadata && metadataFieldName) {
        d = {
          ...d,
          [metadataFieldName]: {
            [errorFieldName]: serializedError,
          },
        };

        // The error should be placed at the root level
      } else {
        d = {
          ...d,
          [errorFieldName]: serializedError,
        };
      }

      hasObjData = true;
    }

    if (this.pluginManager.hasPlugins(PluginCallbackType.onBeforeDataOut)) {
      d = this.pluginManager.runOnBeforeDataOut({
        data: hasObjData ? d : undefined,
        logLevel,
      });

      if (d && !hasObjData) {
        hasObjData = true;
      }
    }

    if (this.pluginManager.hasPlugins(PluginCallbackType.onBeforeMessageOut)) {
      params = this.pluginManager.runOnBeforeMessageOut({
        messages: [...params],
        logLevel,
      });
    }

    if (Array.isArray(this._config.transport)) {
      for (const transport of this._config.transport) {
        if (!transport.enabled) {
          continue;
        }

        if (this.pluginManager.hasPlugins(PluginCallbackType.shouldSendToLogger)) {
          const shouldSend = this.pluginManager.runShouldSendToLogger({
            messages: [...params],
            data: hasObjData ? d : undefined,
            logLevel,
            transportId: transport.id,
          });

          if (!shouldSend) {
            continue;
          }
        }

        transport._sendToLogger({
          logLevel,
          messages: [...params],
          data: hasObjData ? d : undefined,
          hasData: hasObjData,
        });
      }
    } else {
      if (!this._config.transport.enabled) {
        return;
      }

      if (this.pluginManager.hasPlugins(PluginCallbackType.shouldSendToLogger)) {
        const shouldSend = this.pluginManager.runShouldSendToLogger({
          messages: [...params],
          data: hasObjData ? d : undefined,
          logLevel,
          transportId: this._config.transport.id,
        });

        if (!shouldSend) {
          return;
        }
      }

      this._config.transport._sendToLogger({
        logLevel,
        messages: [...params],
        data: hasObjData ? d : undefined,
        hasData: hasObjData,
      });
    }
  }
}
