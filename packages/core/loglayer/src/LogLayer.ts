import { type ErrorOnlyOpts, type ILogLayer, LogLevel, type MessageDataType } from "@loglayer/shared";
import { LogBuilder } from "./LogBuilder.js";
import { PluginManager } from "./PluginManager.js";
import type { LogLayerConfig } from "./types/index.js";

import { type LogLayerPlugin, PluginCallbackType } from "@loglayer/plugin";
import type { LogLayerTransport } from "@loglayer/transport";

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
  private hasMultipleTransports: boolean;
  private singleTransport: LogLayerTransport | null;

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

    this._initializeTransports(this._config.transport);
  }

  private _initializeTransports(transports: LogLayerTransport | Array<LogLayerTransport>) {
    // Dispose of any existing transports
    if (this.idToTransport) {
      for (const id in this.idToTransport) {
        if (this.idToTransport[id] && typeof this.idToTransport[id][Symbol.dispose] === "function") {
          this.idToTransport[id][Symbol.dispose]();
        }
      }
    }

    this.hasMultipleTransports = Array.isArray(transports) && transports.length > 1;
    this.singleTransport = this.hasMultipleTransports ? null : Array.isArray(transports) ? transports[0] : transports;

    if (Array.isArray(transports)) {
      this.idToTransport = transports.reduce((acc, transport) => {
        acc[transport.id] = transport;
        return acc;
      }, {});
    } else {
      this.idToTransport = {
        [transports.id]: transports,
      };
    }
  }

  /**
   * Calls child() and sets the prefix to be included with every log message.
   *
   * {@link https://loglayer.dev/logging-api/basic-logging.html#message-prefixing | Message Prefixing Docs}
   */
  withPrefix(prefix: string): LogLayer {
    const logger = this.child();
    logger._config.prefix = prefix;

    return logger;
  }

  /**
   * Appends context data which will be included with
   * every log entry.
   *
   * {@link https://loglayer.dev/logging-api/context.html | Context Docs}
   */
  withContext(context: Record<string, any>): LogLayer {
    let updatedContext = context;

    if (this.pluginManager.hasPlugins(PluginCallbackType.onContextCalled)) {
      updatedContext = this.pluginManager.runOnContextCalled(context, this);

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
   *
   * {@link https://loglayer.dev/logging-api/context.html | Context Docs}
   */
  getContext() {
    return this.context;
  }

  /**
   * Add additional plugins.
   *
   * {@link https://loglayer.dev/plugins/ | Plugins Docs}
   */
  addPlugins(plugins: Array<LogLayerPlugin>) {
    this.pluginManager.addPlugins(plugins);
  }

  /**
   * Enables a plugin by id.
   *
   * {@link https://loglayer.dev/plugins/ | Plugins Docs}
   */
  enablePlugin(id: string) {
    this.pluginManager.enablePlugin(id);
  }

  /**
   * Disables a plugin by id.
   *
   * {@link https://loglayer.dev/plugins/ | Plugins Docs}
   */
  disablePlugin(id: string) {
    this.pluginManager.disablePlugin(id);
  }

  /**
   * Removes a plugin by id.
   *
   * {@link https://loglayer.dev/plugins/ | Plugins Docs}
   */
  removePlugin(id: string) {
    this.pluginManager.removePlugin(id);
  }

  /**
   * Specifies metadata to include with the log message
   *
   * {@link https://loglayer.dev/logging-api/metadata.html | Metadata Docs}
   */
  withMetadata(metadata: Record<string, any>) {
    return new LogBuilder(this).withMetadata(metadata);
  }

  /**
   * Specifies an Error to include with the log message
   *
   * {@link https://loglayer.dev/logging-api/error-handling.html | Error Handling Docs}
   */
  withError(error: any) {
    return new LogBuilder(this).withError(error);
  }

  /**
   * Creates a new instance of LogLayer but with the initialization
   * configuration and context copied over.
   *
   * {@link https://loglayer.dev/logging-api/child-loggers.html | Child Logging Docs}
   */
  child() {
    const childConfig = {
      ...this._config,
      transport: Array.isArray(this._config.transport) ? [...this._config.transport] : this._config.transport,
    };

    if (this.hasContext) {
      return new LogLayer(childConfig)
        .withContext({
          ...this.context,
        })
        .withPluginManager(this.pluginManager);
    }

    return new LogLayer(childConfig).withPluginManager(this.pluginManager);
  }

  /**
   * Replaces all existing transports with new ones.
   *
   * When used with child loggers, it only affects the current logger instance
   * and does not modify the parent's transports.
   *
   * {@link https://loglayer.dev/logging-api/transport-management.html | Transport Management Docs}
   */
  withFreshTransports(transports: LogLayerTransport | Array<LogLayerTransport>): LogLayer {
    this._config.transport = transports;
    this._initializeTransports(transports);
    return this;
  }

  protected withPluginManager(pluginManager: PluginManager) {
    this.pluginManager = pluginManager;
    return this;
  }

  /**
   * Logs only the error object without a log message
   *
   * {@link https://loglayer.dev/logging-api/error-handling.html | Error Handling Docs}
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
   *
   * {@link https://loglayer.dev/logging-api/metadata.html | Metadata Docs}
   */
  metadataOnly(metadata: Record<string, any>, logLevel: LogLevel = LogLevel.info) {
    const { muteMetadata, consoleDebug } = this._config;

    if (muteMetadata) {
      return;
    }

    let data: Record<string, any> | null = metadata;

    if (this.pluginManager.hasPlugins(PluginCallbackType.onMetadataCalled)) {
      data = this.pluginManager.runOnMetadataCalled(metadata, this);

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
   *
   * {@link https://loglayer.dev/logging-api/basic-logging.html | Basic Logging Docs}
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
   *
   * {@link https://loglayer.dev/logging-api/basic-logging.html | Basic Logging Docs}
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
   *
   * {@link https://loglayer.dev/logging-api/basic-logging.html | Basic Logging Docs}
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
   *
   * {@link https://loglayer.dev/logging-api/basic-logging.html | Basic Logging Docs}
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
   *
   * {@link https://loglayer.dev/logging-api/basic-logging.html | Basic Logging Docs}
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
   *
   * {@link https://loglayer.dev/logging-api/basic-logging.html | Basic Logging Docs}
   */
  fatal(...messages: MessageDataType[]) {
    this._formatMessage(messages);
    this._formatLog({ logLevel: LogLevel.fatal, params: messages });
  }

  /**
   * All logging inputs are dropped and stops sending logs to the logging library.
   *
   * {@link https://loglayer.dev/logging-api/basic-logging.html#enabling-disabling-logging | Enabling/Disabling Logging Docs}
   */
  disableLogging() {
    this._config.enabled = false;
    return this;
  }

  /**
   * Enable sending logs to the logging library.
   *
   * {@link https://loglayer.dev/logging-api/basic-logging.html#enabling-disabling-logging | Enabling/Disabling Logging Docs}
   */
  enableLogging() {
    this._config.enabled = true;
    return this;
  }

  /**
   * Disables inclusion of context data in the print
   *
   * {@link https://loglayer.dev/logging-api/context.html#managing-context | Managing Context Docs}
   */
  muteContext(): ILogLayer {
    this._config.muteContext = true;
    return this;
  }

  /**
   * Enables inclusion of context data in the print
   *
   * {@link https://loglayer.dev/logging-api/context.html#managing-context | Managing Context Docs}
   */
  unMuteContext(): ILogLayer {
    this._config.muteContext = false;
    return this;
  }

  /**
   * Disables inclusion of metadata in the print
   *
   * {@link https://loglayer.dev/logging-api/metadata.html#controlling-metadata-output | Controlling Metadata Output Docs}
   */
  muteMetadata(): ILogLayer {
    this._config.muteMetadata = true;
    return this;
  }

  /**
   * Enables inclusion of metadata in the print
   *
   * {@link https://loglayer.dev/logging-api/metadata.html#controlling-metadata-output | Controlling Metadata Output Docs}
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

  /**
   * Returns a logger instance for a specific transport
   *
   * {@link https://loglayer.dev/logging-api/transport-management.html | Transport Management Docs}
   */
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
      d = this.pluginManager.runOnBeforeDataOut(
        {
          data: hasObjData ? d : undefined,
          logLevel,
        },
        this,
      );

      if (d && !hasObjData) {
        hasObjData = true;
      }
    }

    if (this.pluginManager.hasPlugins(PluginCallbackType.onBeforeMessageOut)) {
      params = this.pluginManager.runOnBeforeMessageOut(
        {
          messages: [...params],
          logLevel,
        },
        this,
      );
    }

    if (this.hasMultipleTransports) {
      const transportPromises = (this._config.transport as LogLayerTransport[])
        .filter((transport) => transport.enabled)
        .map(async (transport) => {
          if (this.pluginManager.hasPlugins(PluginCallbackType.shouldSendToLogger)) {
            const shouldSend = this.pluginManager.runShouldSendToLogger(
              {
                messages: [...params],
                data: hasObjData ? d : undefined,
                logLevel,
                transportId: transport.id,
              },
              this,
            );

            if (!shouldSend) {
              return;
            }
          }

          return transport._sendToLogger({
            logLevel,
            messages: [...params],
            data: hasObjData ? d : undefined,
            hasData: hasObjData,
          });
        });

      // Execute all transports in parallel
      Promise.all(transportPromises).catch((err) => {
        if (this._config.consoleDebug) {
          console.error("[LogLayer] Error executing transports:", err);
        }
      });
    } else {
      // Use cached single transport
      if (!this.singleTransport?.enabled) {
        return;
      }

      if (this.pluginManager.hasPlugins(PluginCallbackType.shouldSendToLogger)) {
        const shouldSend = this.pluginManager.runShouldSendToLogger(
          {
            messages: [...params],
            data: hasObjData ? d : undefined,
            logLevel,
            transportId: this.singleTransport.id,
          },
          this,
        );

        if (!shouldSend) {
          return;
        }
      }

      // Execute single transport synchronously
      this.singleTransport._sendToLogger({
        logLevel,
        messages: [...params],
        data: hasObjData ? d : undefined,
        hasData: hasObjData,
      });
    }
  }
}
