import { DefaultContextManager } from "@loglayer/context-manager";
import { type LogLayerPlugin, PluginCallbackType } from "@loglayer/plugin";
import {
  type ErrorOnlyOpts,
  type IContextManager,
  type ILogLayer,
  LogLevel,
  LogLevelPriority,
  type LogLevelType,
  type MessageDataType,
  type RawLogEntry,
} from "@loglayer/shared";
import type { LogLayerTransport } from "@loglayer/transport";
import { LogBuilder } from "./LogBuilder.js";
import { PluginManager } from "./PluginManager.js";
import type { LogLayerConfig } from "./types/index.js";

interface FormatLogParams {
  logLevel: LogLevelType;
  params?: any[];
  metadata?: Record<string, any> | null;
  err?: any;
  context?: Record<string, any> | null;
}

interface LogLevelEnabledStatus {
  info: boolean;
  warn: boolean;
  error: boolean;
  debug: boolean;
  trace: boolean;
  fatal: boolean;
}

/**
 * Wraps around a logging framework to provide convenience methods that allow
 * developers to programmatically specify their errors and metadata along with
 * a message in a consistent fashion.
 */
export class LogLayer implements ILogLayer {
  private pluginManager: PluginManager;
  private idToTransport: Record<string, any>;
  private hasMultipleTransports: boolean;
  private singleTransport: LogLayerTransport | null;
  private contextManager: IContextManager;
  private logLevelEnabledStatus: LogLevelEnabledStatus = {
    info: true,
    warn: true,
    error: true,
    debug: true,
    trace: true,
    fatal: true,
  };

  /**
   * The configuration object used to initialize the logger.
   * This is for internal use only and should not be modified directly.
   */
  _config: LogLayerConfig;

  constructor(config: LogLayerConfig) {
    this._config = {
      ...config,
      enabled: config.enabled ?? true,
    };

    if (!this._config.enabled) {
      this.disableLogging();
    }

    this.contextManager = new DefaultContextManager();
    this.pluginManager = new PluginManager(config.plugins || []);

    if (!this._config.errorFieldName) {
      this._config.errorFieldName = "err";
    }

    if (!this._config.copyMsgOnOnlyError) {
      this._config.copyMsgOnOnlyError = false;
    }

    this._initializeTransports(this._config.transport);
  }

  /**
   * Sets the context manager to use for managing context data.
   */
  withContextManager(contextManager: IContextManager): LogLayer {
    // Dispose of the existing context manager if it implements Disposable
    if (this.contextManager && typeof (this.contextManager as any)[Symbol.dispose] === "function") {
      (this.contextManager as any)[Symbol.dispose]();
    }

    this.contextManager = contextManager;
    return this;
  }

  /**
   * Returns the context manager instance being used.
   */
  getContextManager<M extends IContextManager = IContextManager>(): M {
    return this.contextManager as M;
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
   * @see {@link https://loglayer.dev/logging-api/basic-logging.html#message-prefixing | Message Prefixing Docs}
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
   * Passing in an empty value / object will *not* clear the context.
   *
   * To clear the context, use {@link https://loglayer.dev/logging-api/context.html#clearing-context | clearContext()}.
   *
   * @see {@link https://loglayer.dev/logging-api/context.html | Context Docs}
   */
  withContext(context?: Record<string, any>): LogLayer {
    let updatedContext = context;

    if (!context) {
      if (this._config.consoleDebug) {
        console.debug("[LogLayer] withContext was called with no context; dropping.");
      }

      return this;
    }

    if (this.pluginManager.hasPlugins(PluginCallbackType.onContextCalled)) {
      updatedContext = this.pluginManager.runOnContextCalled(context, this);

      if (!updatedContext) {
        if (this._config.consoleDebug) {
          console.debug("[LogLayer] Context was dropped due to plugin returning falsy value.");
        }

        return this;
      }
    }

    this.contextManager.appendContext(updatedContext);
    return this;
  }

  /**
   * Clears the context data.
   */
  clearContext() {
    this.contextManager.setContext(undefined);

    return this;
  }

  getContext(): Record<string, any> {
    return this.contextManager.getContext();
  }

  /**
   * Add additional plugins.
   *
   * @see {@link https://loglayer.dev/plugins/ | Plugins Docs}
   */
  addPlugins(plugins: Array<LogLayerPlugin>) {
    this.pluginManager.addPlugins(plugins);
  }

  /**
   * Enables a plugin by id.
   *
   * @see {@link https://loglayer.dev/plugins/ | Plugins Docs}
   */
  enablePlugin(id: string) {
    this.pluginManager.enablePlugin(id);
  }

  /**
   * Disables a plugin by id.
   *
   * @see {@link https://loglayer.dev/plugins/ | Plugins Docs}
   */
  disablePlugin(id: string) {
    this.pluginManager.disablePlugin(id);
  }

  /**
   * Removes a plugin by id.
   *
   * @see {@link https://loglayer.dev/plugins/ | Plugins Docs}
   */
  removePlugin(id: string) {
    this.pluginManager.removePlugin(id);
  }

  /**
   * Specifies metadata to include with the log message
   *
   * @see {@link https://loglayer.dev/logging-api/metadata.html | Metadata Docs}
   */
  withMetadata(metadata?: Record<string, any>) {
    return new LogBuilder(this).withMetadata(metadata);
  }

  /**
   * Specifies an Error to include with the log message
   *
   * @see {@link https://loglayer.dev/logging-api/error-handling.html | Error Handling Docs}
   */
  withError(error: any) {
    return new LogBuilder(this).withError(error);
  }

  /**
   * Creates a new instance of LogLayer but with the initialization
   * configuration and context copied over.
   *
   * @see {@link https://loglayer.dev/logging-api/child-loggers.html | Child Logging Docs}
   */
  child(): LogLayer {
    const childConfig = {
      ...this._config,
      transport: Array.isArray(this._config.transport) ? [...this._config.transport] : this._config.transport,
    };

    const childLogger = new LogLayer(childConfig)
      .withPluginManager(this.pluginManager)
      .withContextManager(this.contextManager.clone());

    // Notify context manager about child logger creation
    this.contextManager.onChildLoggerCreated({
      parentContextManager: this.contextManager,
      childContextManager: childLogger.contextManager,
      parentLogger: this,
      childLogger,
    });

    return childLogger;
  }

  /**
   * Replaces all existing transports with new ones.
   *
   * When used with child loggers, it only affects the current logger instance
   * and does not modify the parent's transports.
   *
   * @see {@link https://loglayer.dev/logging-api/transport-management.html | Transport Management Docs}
   */
  withFreshTransports(transports: LogLayerTransport | Array<LogLayerTransport>): LogLayer {
    this._config.transport = transports;
    this._initializeTransports(transports);
    return this;
  }

  /**
   * Replaces all existing plugins with new ones.
   *
   * When used with child loggers, it only affects the current logger instance
   * and does not modify the parent's plugins.
   *
   * @see {@link https://loglayer.dev/plugins/ | Plugins Docs}
   */
  withFreshPlugins(plugins: Array<LogLayerPlugin>): LogLayer {
    this._config.plugins = plugins;
    this.pluginManager = new PluginManager(plugins);
    return this;
  }

  protected withPluginManager(pluginManager: PluginManager) {
    this.pluginManager = pluginManager;
    return this;
  }

  /**
   * Logs only the error object without a log message
   *
   * @see {@link https://loglayer.dev/logging-api/error-handling.html | Error Handling Docs}
   */
  errorOnly(error: any, opts?: ErrorOnlyOpts) {
    const logLevel = opts?.logLevel || LogLevel.error;
    if (!this.isLevelEnabled(logLevel)) return;

    const { copyMsgOnOnlyError } = this._config;

    const formatLogConf: FormatLogParams = {
      logLevel,
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
   * @see {@link https://loglayer.dev/logging-api/metadata.html | Metadata Docs}
   */
  metadataOnly(metadata?: Record<string, any>, logLevel: LogLevelType = LogLevel.info) {
    if (!this.isLevelEnabled(logLevel)) return;

    const { muteMetadata, consoleDebug } = this._config;

    if (muteMetadata) {
      return;
    }

    if (!metadata) {
      if (consoleDebug) {
        console.debug("[LogLayer] metadataOnly was called with no metadata; dropping.");
      }

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
   * @see {@link https://loglayer.dev/logging-api/basic-logging.html | Basic Logging Docs}
   */
  info(...messages: MessageDataType[]) {
    if (!this.isLevelEnabled(LogLevel.info)) return;
    this._formatMessage(messages);
    this._formatLog({ logLevel: LogLevel.info, params: messages });
  }

  /**
   * Sends a log message to the logging library under the warn log level
   *
   * @see {@link https://loglayer.dev/logging-api/basic-logging.html | Basic Logging Docs}
   */
  warn(...messages: MessageDataType[]) {
    if (!this.isLevelEnabled(LogLevel.warn)) return;
    this._formatMessage(messages);
    this._formatLog({ logLevel: LogLevel.warn, params: messages });
  }

  /**
   * Sends a log message to the logging library under the error log level
   *
   * @see {@link https://loglayer.dev/logging-api/basic-logging.html | Basic Logging Docs}
   */
  error(...messages: MessageDataType[]) {
    if (!this.isLevelEnabled(LogLevel.error)) return;
    this._formatMessage(messages);
    this._formatLog({ logLevel: LogLevel.error, params: messages });
  }

  /**
   * Sends a log message to the logging library under the debug log level
   *
   * @see {@link https://loglayer.dev/logging-api/basic-logging.html | Basic Logging Docs}
   */
  debug(...messages: MessageDataType[]) {
    if (!this.isLevelEnabled(LogLevel.debug)) return;
    this._formatMessage(messages);
    this._formatLog({ logLevel: LogLevel.debug, params: messages });
  }

  /**
   * Sends a log message to the logging library under the trace log level
   *
   * @see {@link https://loglayer.dev/logging-api/basic-logging.html | Basic Logging Docs}
   */
  trace(...messages: MessageDataType[]) {
    if (!this.isLevelEnabled(LogLevel.trace)) return;
    this._formatMessage(messages);
    this._formatLog({ logLevel: LogLevel.trace, params: messages });
  }

  /**
   * Sends a log message to the logging library under the fatal log level
   *
   * @see {@link https://loglayer.dev/logging-api/basic-logging.html | Basic Logging Docs}
   */
  fatal(...messages: MessageDataType[]) {
    if (!this.isLevelEnabled(LogLevel.fatal)) return;
    this._formatMessage(messages);
    this._formatLog({ logLevel: LogLevel.fatal, params: messages });
  }

  /**
   * Logs a raw log entry with complete control over all log parameters.
   *
   * This method allows you to bypass the normal LogLayer API and directly specify
   * all aspects of a log entry including log level, messages, metadata, and error.
   * It's useful for scenarios where you need to log structured data that doesn't
   * fit the standard LogLayer patterns, or when integrating with external logging
   * systems that provide pre-formatted log entries.
   *
   * The raw entry will still go through all LogLayer processing.
   *
   * @see {@link https://loglayer.dev/logging-api/basic-logging.html | Basic Logging Docs}
   */
  raw(logEntry: RawLogEntry) {
    if (!this.isLevelEnabled(logEntry.logLevel)) return;

    const formatLogConf: FormatLogParams = {
      logLevel: logEntry.logLevel,
      params: logEntry.messages,
      metadata: logEntry.metadata,
      err: logEntry.error,
      context: logEntry.context,
    };

    this._formatMessage(logEntry.messages);

    this._formatLog(formatLogConf);
  }

  /**
   * All logging inputs are dropped and stops sending logs to the logging library.
   *
   * @see {@link https://loglayer.dev/logging-api/basic-logging.html#enabling-disabling-logging | Enabling/Disabling Logging Docs}
   */
  disableLogging() {
    for (const level of Object.keys(this.logLevelEnabledStatus)) {
      this.logLevelEnabledStatus[level as keyof LogLevelEnabledStatus] = false;
    }
    return this;
  }

  /**
   * Enable sending logs to the logging library.
   *
   * @see {@link https://loglayer.dev/logging-api/basic-logging.html#enabling-disabling-logging | Enabling/Disabling Logging Docs}
   */
  enableLogging() {
    for (const level of Object.keys(this.logLevelEnabledStatus)) {
      this.logLevelEnabledStatus[level as keyof LogLevelEnabledStatus] = true;
    }
    return this;
  }

  /**
   * Disables inclusion of context data in the print
   *
   * @see {@link https://loglayer.dev/logging-api/context.html#managing-context | Managing Context Docs}
   */
  muteContext(): ILogLayer {
    this._config.muteContext = true;
    return this;
  }

  /**
   * Enables inclusion of context data in the print
   *
   * @see {@link https://loglayer.dev/logging-api/context.html#managing-context | Managing Context Docs}
   */
  unMuteContext(): ILogLayer {
    this._config.muteContext = false;
    return this;
  }

  /**
   * Disables inclusion of metadata in the print
   *
   * @see {@link https://loglayer.dev/logging-api/metadata.html#controlling-metadata-output | Controlling Metadata Output Docs}
   */
  muteMetadata(): ILogLayer {
    this._config.muteMetadata = true;
    return this;
  }

  /**
   * Enables inclusion of metadata in the print
   *
   * @see {@link https://loglayer.dev/logging-api/metadata.html#controlling-metadata-output | Controlling Metadata Output Docs}
   */
  unMuteMetadata(): ILogLayer {
    this._config.muteMetadata = false;
    return this;
  }

  /**
   * Enables a specific log level
   *
   * @see {@link https://loglayer.dev/logging-api/basic-logging.html#enabling-disabling-logging | Enabling/Disabling Logging Docs}
   */
  enableIndividualLevel(logLevel: LogLevelType): ILogLayer {
    const level = logLevel as keyof LogLevelEnabledStatus;
    if (level in this.logLevelEnabledStatus) {
      this.logLevelEnabledStatus[level] = true;
    }
    return this;
  }

  /**
   * Disables a specific log level
   *
   * @see {@link https://loglayer.dev/logging-api/basic-logging.html#enabling-disabling-logging | Enabling/Disabling Logging Docs}
   */
  disableIndividualLevel(logLevel: LogLevelType): ILogLayer {
    const level = logLevel as keyof LogLevelEnabledStatus;
    if (level in this.logLevelEnabledStatus) {
      this.logLevelEnabledStatus[level] = false;
    }
    return this;
  }

  /**
   * Sets the minimum log level to be used by the logger. Only messages with
   * this level or higher severity will be logged.
   *
   * For example, if you setLevel(LogLevel.warn), this will:
   * Enable:
   * - warn
   * - error
   * - fatal
   * Disable:
   * - info
   * - debug
   * - trace
   *
   * @see {@link https://loglayer.dev/logging-api/basic-logging.html#enabling-disabling-logging | Enabling/Disabling Logging Docs}
   */
  setLevel(logLevel: LogLevelType): ILogLayer {
    const minLogValue = LogLevelPriority[logLevel];

    // Enable levels with value >= minLogValue, disable others
    for (const level of Object.values(LogLevel)) {
      const levelKey = level as keyof LogLevelEnabledStatus;
      const levelValue = LogLevelPriority[level];

      this.logLevelEnabledStatus[levelKey] = levelValue >= minLogValue;
    }

    return this;
  }

  /**
   * Checks if a specific log level is enabled
   *
   * @see {@link https://loglayer.dev/logging-api/basic-logging.html#checking-if-a-log-level-is-enabled | Checking if a Log Level is Enabled Docs}
   */
  isLevelEnabled(logLevel: LogLevelType): boolean {
    const level = logLevel as keyof LogLevelEnabledStatus;
    return this.logLevelEnabledStatus[level];
  }

  private formatContext(context: Record<string, any> | null) {
    const { contextFieldName, muteContext } = this._config;

    if (context && Object.keys(context).length > 0 && !muteContext) {
      if (contextFieldName) {
        return {
          [contextFieldName]: {
            ...context,
          },
        };
      }

      return {
        ...context,
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
   * @see {@link https://loglayer.dev/logging-api/transport-management.html | Transport Management Docs}
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

  _formatLog({ logLevel, params = [], metadata = null, err, context = null }: FormatLogParams) {
    const { errorSerializer, errorFieldInMetadata, muteContext, contextFieldName, metadataFieldName, errorFieldName } =
      this._config;

    // Use provided context or fall back to context manager
    const contextData = context !== null ? context : this.contextManager.getContext();

    let hasObjData =
      !!metadata ||
      (muteContext ? false : context !== null ? Object.keys(context).length > 0 : this.contextManager.hasContextData());

    let d: Record<string, any> | undefined | null = {};

    if (hasObjData) {
      // Field names for context and metadata is the same, merge the metadata into the same field name
      if (contextFieldName && contextFieldName === metadataFieldName) {
        const formattedContextData = this.formatContext(contextData)[contextFieldName];
        const updatedMetadata = this.formatMetadata(metadata)[metadataFieldName];

        d = {
          [contextFieldName]: {
            ...formattedContextData,
            ...updatedMetadata,
          },
        };
      } else {
        d = {
          ...this.formatContext(contextData),
          ...this.formatMetadata(metadata),
        };
      }
    }

    if (err) {
      const serializedError = errorSerializer ? errorSerializer(err) : err;

      // The error should be placed into a metadata field
      if (errorFieldInMetadata && metadata && metadataFieldName) {
        // Add error to the existing metadata field in the formatted data
        if (d?.[metadataFieldName]) {
          d[metadataFieldName][errorFieldName] = serializedError;
        } else {
          d = {
            ...d,
            [metadataFieldName]: {
              [errorFieldName]: serializedError,
            },
          };
        }
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
          error: err,
          metadata,
          context: contextData,
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
                error: err,
                metadata,
                context: contextData,
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
            error: err,
            metadata,
            context: contextData,
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
            error: err,
            metadata,
            context: contextData,
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
        error: err,
        metadata,
        context: contextData,
      });
    }
  }
}
