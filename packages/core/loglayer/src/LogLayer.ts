import { DefaultContextManager } from "@loglayer/context-manager";
import { DefaultLogLevelManager } from "@loglayer/log-level-manager";
import { type LogLayerPlugin, PluginCallbackType } from "@loglayer/plugin";
import {
  type ContainsAsyncLazy,
  countLazyValues,
  type ErrorOnlyOpts,
  hasPromiseValues,
  type IContextManager,
  type ILogBuilder,
  type ILogLayer,
  type ILogLevelManager,
  isLazy,
  type LazyEvalFailure,
  type LogGroupConfig,
  type LogGroupsConfig,
  type LogLayerContext,
  type LogLayerData,
  type LogLayerMetadata,
  LogLevel,
  LogLevelPriority,
  type LogLevelType,
  type LogReturnType,
  type MessageDataType,
  type RawLogEntry,
  replacePromiseValues,
  resolveLazyValues,
  resolvePromiseValues,
} from "@loglayer/shared";
import type { LogLayerTransport } from "@loglayer/transport";
import { LogBuilder } from "./LogBuilder.js";
import { mixinRegistry } from "./mixins.js";
import { PluginManager } from "./PluginManager.js";
import type { LogLayerConfig } from "./types/index.js";

interface FormatLogParams {
  logLevel: LogLevelType;
  params?: any[];
  metadata?: LogLayerMetadata | null;
  err?: any;
  context?: LogLayerContext | null;
  groups?: string[] | null;
}

/**
 * Wraps around a logging framework to provide convenience methods that allow
 * developers to programmatically specify their errors and metadata along with
 * a message in a consistent fashion.
 */
export class LogLayer implements ILogLayer<LogLayer> {
  private pluginManager: PluginManager;
  private idToTransport: Record<string, any>;
  private hasMultipleTransports: boolean;
  private singleTransport: LogLayerTransport | null;
  private contextManager: IContextManager;
  private logLevelManager: ILogLevelManager;
  private _isLoggingLazyError = false;
  private _lazyContextCount = 0;
  private _assignedGroups: string[] | null = null;
  private _groupsConfig: LogGroupsConfig | null = null;
  private _activeGroups: Set<string> | null = null;
  private _ungroupedBehavior: "all" | "none" | string[] = "all";

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

    this.contextManager = new DefaultContextManager();
    this.logLevelManager = new DefaultLogLevelManager();

    if (!this._config.enabled) {
      this.disableLogging();
    }
    const plugins = [...(config.plugins || []), ...mixinRegistry.pluginsToInit];
    this.pluginManager = new PluginManager(plugins);

    if (!this._config.errorFieldName) {
      this._config.errorFieldName = "err";
    }

    if (!this._config.copyMsgOnOnlyError) {
      this._config.copyMsgOnOnlyError = false;
    }

    this._initializeTransports(this._config.transport);

    // Initialize groups
    this._groupsConfig = config.groups ? { ...config.groups } : null;
    this._ungroupedBehavior = config.ungroupedBehavior ?? "all";
    this._activeGroups = config.activeGroups ? new Set(config.activeGroups) : null;
    this._parseEnvGroups();

    if (mixinRegistry.logLayerHandlers.length > 0) {
      mixinRegistry.logLayerHandlers.forEach((mixin) => {
        if (mixin.onConstruct) {
          mixin.onConstruct(this, config);
        }
      });
    }
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
    this._lazyContextCount = contextManager.hasContextData() ? countLazyValues(contextManager.getContext()) : 0;
    return this;
  }

  /**
   * Returns the context manager instance being used.
   */
  getContextManager<M extends IContextManager = IContextManager>(): M {
    return this.contextManager as M;
  }

  /**
   * Sets the log level manager to use for managing log levels.
   */
  withLogLevelManager(logLevelManager: ILogLevelManager): LogLayer {
    // Dispose of the existing log level manager if it implements Disposable
    if (this.logLevelManager && typeof (this.logLevelManager as any)[Symbol.dispose] === "function") {
      (this.logLevelManager as any)[Symbol.dispose]();
    }

    this.logLevelManager = logLevelManager;
    return this;
  }

  /**
   * Returns the log level manager instance being used.
   */
  getLogLevelManager<M extends ILogLevelManager = ILogLevelManager>(): M {
    return this.logLevelManager as M;
  }

  /**
   * Returns the configuration object used to initialize the logger.
   */
  getConfig(): LogLayerConfig {
    return this._config;
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
   * Creates a child logger with the specified group(s) persistently assigned.
   * All logs from the child will be tagged with these groups.
   *
   * @see {@link https://loglayer.dev/logging-api/groups.html | Groups Docs}
   */
  withGroup(group: string | string[]): LogLayer {
    const logger = this.child();
    const newGroups = Array.isArray(group) ? group : [group];

    if (logger._assignedGroups) {
      const combined = new Set([...logger._assignedGroups, ...newGroups]);
      logger._assignedGroups = Array.from(combined);
    } else {
      logger._assignedGroups = [...newGroups];
    }

    return logger;
  }

  /**
   * Adds a new group definition at runtime.
   *
   * @see {@link https://loglayer.dev/logging-api/groups.html | Groups Docs}
   */
  addGroup(name: string, config: LogGroupConfig): LogLayer {
    if (!this._groupsConfig) {
      this._groupsConfig = {};
    }
    this._groupsConfig[name] = { ...config };
    return this;
  }

  /**
   * Removes a group definition at runtime.
   *
   * @see {@link https://loglayer.dev/logging-api/groups.html | Groups Docs}
   */
  removeGroup(name: string): LogLayer {
    if (this._groupsConfig) {
      delete this._groupsConfig[name];
      if (Object.keys(this._groupsConfig).length === 0) {
        this._groupsConfig = null;
      }
    }
    return this;
  }

  /**
   * Enables a group by name (sets enabled: true).
   *
   * @see {@link https://loglayer.dev/logging-api/groups.html | Groups Docs}
   */
  enableGroup(name: string): LogLayer {
    if (this._groupsConfig?.[name]) {
      this._groupsConfig[name] = { ...this._groupsConfig[name], enabled: true };
    }
    return this;
  }

  /**
   * Disables a group by name (sets enabled: false).
   *
   * @see {@link https://loglayer.dev/logging-api/groups.html | Groups Docs}
   */
  disableGroup(name: string): LogLayer {
    if (this._groupsConfig?.[name]) {
      this._groupsConfig[name] = { ...this._groupsConfig[name], enabled: false };
    }
    return this;
  }

  /**
   * Sets the minimum log level for a group at runtime.
   *
   * @see {@link https://loglayer.dev/logging-api/groups.html | Groups Docs}
   */
  setGroupLevel(name: string, level: LogLevelType): LogLayer {
    if (this._groupsConfig?.[name]) {
      this._groupsConfig[name] = { ...this._groupsConfig[name], level };
    }
    return this;
  }

  /**
   * Sets which groups are active. Only active groups will route logs.
   * Pass null to clear the filter (all groups active).
   *
   * @see {@link https://loglayer.dev/logging-api/groups.html | Groups Docs}
   */
  setActiveGroups(groups: string[] | null): LogLayer {
    this._activeGroups = groups ? new Set(groups) : null;
    return this;
  }

  /**
   * Returns a snapshot of all group configurations.
   *
   * @see {@link https://loglayer.dev/logging-api/groups.html | Groups Docs}
   */
  getGroups(): LogGroupsConfig {
    return this._groupsConfig ? { ...this._groupsConfig } : {};
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
  withContext(context?: LogLayerContext): LogLayer {
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

    // Update lazy context count: account for new lazy values and overwritten lazy values
    const currentContext = this.contextManager.getContext();
    for (const key of Object.keys(updatedContext)) {
      const wasLazy = key in currentContext && isLazy(currentContext[key]);
      const nowLazy = isLazy(updatedContext[key]);
      if (!wasLazy && nowLazy) this._lazyContextCount++;
      else if (wasLazy && !nowLazy) this._lazyContextCount--;
    }

    this.contextManager.appendContext(updatedContext);
    return this;
  }

  /**
   * Clears the context data. If keys are provided, only those keys will be removed.
   * If no keys are provided, all context data will be cleared.
   */
  clearContext(keys?: string | string[]) {
    if (keys !== undefined && this._lazyContextCount > 0) {
      const context = this.contextManager.getContext();
      const keysToRemove = Array.isArray(keys) ? keys : [keys];
      for (const key of keysToRemove) {
        if (key in context && isLazy(context[key])) {
          this._lazyContextCount--;
        }
      }
    } else if (keys === undefined) {
      this._lazyContextCount = 0;
    }

    this.contextManager.clearContext(keys);
    return this;
  }

  getContext(options?: { raw?: boolean }): LogLayerContext {
    const context = this.contextManager.getContext();
    if (options?.raw || this._lazyContextCount === 0) {
      return context;
    }

    const { resolved, errors } = resolveLazyValues(context);

    if (errors) {
      this._logLazyEvalErrors(errors, "context");
    }

    // Async lazy values are not supported in context — replace with error indicators
    const { resolved: finalResolved, asyncKeys } = replacePromiseValues(resolved);
    if (asyncKeys) {
      this._logAsyncLazyContextErrors(asyncKeys);
    }

    return finalResolved;
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
  withMetadata<M extends LogLayerMetadata>(metadata?: M): ILogBuilder<any, ContainsAsyncLazy<NonNullable<M>>> {
    return new LogBuilder(this).withMetadata(metadata) as any;
  }

  /**
   * Specifies an Error to include with the log message
   *
   * @see {@link https://loglayer.dev/logging-api/error-handling.html | Error Handling Docs}
   */
  withError(error: any): ILogBuilder<any, false> {
    return new LogBuilder(this).withError(error) as any;
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
      .withContextManager(this.contextManager.clone())
      .withLogLevelManager(this.logLevelManager.clone());

    // Notify context manager about child logger creation
    this.contextManager.onChildLoggerCreated({
      parentContextManager: this.contextManager,
      childContextManager: childLogger.contextManager,
      parentLogger: this,
      childLogger,
    });

    // Notify log level manager about child logger creation
    this.logLevelManager.onChildLoggerCreated({
      parentLogLevelManager: this.logLevelManager,
      childLogLevelManager: childLogger.logLevelManager,
      parentLogger: this,
      childLogger,
    });

    // Set lazy context count based on what the context manager actually gave the child
    childLogger._lazyContextCount = childLogger.contextManager.hasContextData()
      ? countLazyValues(childLogger.contextManager.getContext())
      : 0;

    // Copy groups state to child
    // _groupsConfig and _activeGroups are shared by reference so runtime changes propagate
    childLogger._groupsConfig = this._groupsConfig;
    childLogger._activeGroups = this._activeGroups;
    childLogger._ungroupedBehavior = this._ungroupedBehavior;
    // _assignedGroups is copied so children can have different persistent group tags
    childLogger._assignedGroups = this._assignedGroups ? [...this._assignedGroups] : null;

    return childLogger;
  }

  /**
   * Replaces all existing transports with new ones.
   *
   * Transport changes only affect the current logger instance. Child loggers
   * created before the change will retain their original transports, and
   * parent loggers are not affected when a child modifies its transports.
   *
   * @see {@link https://loglayer.dev/logging-api/transport-management.html | Transport Management Docs}
   */
  withFreshTransports(transports: LogLayerTransport | Array<LogLayerTransport>): LogLayer {
    this._config.transport = transports;
    this._initializeTransports(transports);
    return this;
  }

  /**
   * Adds one or more transports to the existing transports.
   * If a transport with the same ID already exists, it will be replaced.
   *
   * Transport changes only affect the current logger instance. Child loggers
   * created before the change will retain their original transports, and
   * parent loggers are not affected when a child modifies its transports.
   *
   * @see {@link https://loglayer.dev/logging-api/transport-management.html | Transport Management Docs}
   */
  addTransport(transports: LogLayerTransport | Array<LogLayerTransport>): LogLayer {
    const newTransports = Array.isArray(transports) ? transports : [transports];
    const existingTransports = Array.isArray(this._config.transport)
      ? this._config.transport
      : [this._config.transport];

    // Build set of new transport IDs for quick lookup
    const newTransportIds = new Set(newTransports.map((t) => t.id));

    // Dispose and remove any existing transports with the same IDs
    for (const transport of newTransports) {
      const existingTransport = this.idToTransport[transport.id];
      if (existingTransport && typeof existingTransport[Symbol.dispose] === "function") {
        existingTransport[Symbol.dispose]();
      }
    }

    // Filter out existing transports that will be replaced, then add new ones
    const filteredExisting = existingTransports.filter((t) => !newTransportIds.has(t.id));
    const allTransports = [...filteredExisting, ...newTransports];
    this._config.transport = allTransports;

    // Update the transport map
    for (const transport of newTransports) {
      this.idToTransport[transport.id] = transport;
    }

    // Update optimization flags
    this.hasMultipleTransports = allTransports.length > 1;
    this.singleTransport = this.hasMultipleTransports ? null : allTransports[0];

    return this;
  }

  /**
   * Removes a transport by its ID.
   *
   * Transport changes only affect the current logger instance. Child loggers
   * created before the change will retain their original transports, and
   * parent loggers are not affected when a child modifies its transports.
   *
   * @returns true if the transport was found and removed, false otherwise.
   *
   * @see {@link https://loglayer.dev/logging-api/transport-management.html | Transport Management Docs}
   */
  removeTransport(id: string): boolean {
    const transport = this.idToTransport[id];

    if (!transport) {
      return false;
    }

    // Dispose of the transport if it implements Disposable
    if (typeof transport[Symbol.dispose] === "function") {
      transport[Symbol.dispose]();
    }

    // Remove from the map
    delete this.idToTransport[id];

    // Update the config.transport array
    const existingTransports = Array.isArray(this._config.transport)
      ? this._config.transport
      : [this._config.transport];

    const remainingTransports = existingTransports.filter((t) => t.id !== id);
    this._config.transport = remainingTransports.length === 1 ? remainingTransports[0] : remainingTransports;

    // Update optimization flags
    this.hasMultipleTransports = remainingTransports.length > 1;
    this.singleTransport = this.hasMultipleTransports ? null : remainingTransports[0] || null;

    return true;
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
  errorOnly(error: any, opts?: ErrorOnlyOpts): void {
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
  metadataOnly<M extends LogLayerMetadata>(
    metadata?: M,
    logLevel: LogLevelType = LogLevel.info,
  ): LogReturnType<ContainsAsyncLazy<NonNullable<M>>> {
    if (!this.isLevelEnabled(logLevel)) return undefined as any;

    const { muteMetadata, consoleDebug } = this._config;

    if (muteMetadata) {
      return undefined as any;
    }

    if (!metadata) {
      if (consoleDebug) {
        console.debug("[LogLayer] metadataOnly was called with no metadata; dropping.");
      }

      return undefined as any;
    }

    let data: LogLayerMetadata | null = metadata;

    if (this.pluginManager.hasPlugins(PluginCallbackType.onMetadataCalled)) {
      data = this.pluginManager.runOnMetadataCalled(metadata, this);

      if (!data) {
        if (consoleDebug) {
          console.debug("[LogLayer] Metadata was dropped due to plugin returning falsy value.");
        }

        return undefined as any;
      }
    }

    const config: FormatLogParams = {
      logLevel,
      metadata: data,
    };

    return this._formatLog(config) as any;
  }

  /**
   * Sends a log message to the logging library under an info log level.
   *
   * The logging library may or may not support multiple message parameters and only
   * the first parameter would be used.
   *
   * @see {@link https://loglayer.dev/logging-api/basic-logging.html | Basic Logging Docs}
   */
  info(...messages: MessageDataType[]): void {
    if (!this.isLevelEnabled(LogLevel.info)) return;
    this._formatMessage(messages);
    this._formatLog({ logLevel: LogLevel.info, params: messages });
  }

  /**
   * Sends a log message to the logging library under the warn log level
   *
   * @see {@link https://loglayer.dev/logging-api/basic-logging.html | Basic Logging Docs}
   */
  warn(...messages: MessageDataType[]): void {
    if (!this.isLevelEnabled(LogLevel.warn)) return;
    this._formatMessage(messages);
    this._formatLog({ logLevel: LogLevel.warn, params: messages });
  }

  /**
   * Sends a log message to the logging library under the error log level
   *
   * @see {@link https://loglayer.dev/logging-api/basic-logging.html | Basic Logging Docs}
   */
  error(...messages: MessageDataType[]): void {
    if (!this.isLevelEnabled(LogLevel.error)) return;
    this._formatMessage(messages);
    this._formatLog({ logLevel: LogLevel.error, params: messages });
  }

  /**
   * Sends a log message to the logging library under the debug log level
   *
   * @see {@link https://loglayer.dev/logging-api/basic-logging.html | Basic Logging Docs}
   */
  debug(...messages: MessageDataType[]): void {
    if (!this.isLevelEnabled(LogLevel.debug)) return;
    this._formatMessage(messages);
    this._formatLog({ logLevel: LogLevel.debug, params: messages });
  }

  /**
   * Sends a log message to the logging library under the trace log level
   *
   * @see {@link https://loglayer.dev/logging-api/basic-logging.html | Basic Logging Docs}
   */
  trace(...messages: MessageDataType[]): void {
    if (!this.isLevelEnabled(LogLevel.trace)) return;
    this._formatMessage(messages);
    this._formatLog({ logLevel: LogLevel.trace, params: messages });
  }

  /**
   * Sends a log message to the logging library under the fatal log level
   *
   * @see {@link https://loglayer.dev/logging-api/basic-logging.html | Basic Logging Docs}
   */
  fatal(...messages: MessageDataType[]): void {
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
  raw<R extends RawLogEntry>(logEntry: R): LogReturnType<ContainsAsyncLazy<NonNullable<R["metadata"]>>> {
    if (!this.isLevelEnabled(logEntry.logLevel)) return undefined as any;

    const formatLogConf: FormatLogParams = {
      logLevel: logEntry.logLevel,
      params: logEntry.messages,
      metadata: logEntry.metadata,
      err: logEntry.error,
      context: logEntry.context,
    };

    this._formatMessage(logEntry.messages);

    return this._formatLog(formatLogConf) as any;
  }

  /**
   * All logging inputs are dropped and stops sending logs to the logging library.
   *
   * @see {@link https://loglayer.dev/logging-api/basic-logging.html#enabling-disabling-logging | Enabling/Disabling Logging Docs}
   */
  disableLogging() {
    this.logLevelManager.disableLogging();
    return this;
  }

  /**
   * Enable sending logs to the logging library.
   *
   * @see {@link https://loglayer.dev/logging-api/basic-logging.html#enabling-disabling-logging | Enabling/Disabling Logging Docs}
   */
  enableLogging() {
    this.logLevelManager.enableLogging();
    return this;
  }

  /**
   * Disables inclusion of context data in the print
   *
   * @see {@link https://loglayer.dev/logging-api/context.html#managing-context | Managing Context Docs}
   */
  muteContext() {
    this._config.muteContext = true;
    return this;
  }

  /**
   * Enables inclusion of context data in the print
   *
   * @see {@link https://loglayer.dev/logging-api/context.html#managing-context | Managing Context Docs}
   */
  unMuteContext() {
    this._config.muteContext = false;
    return this;
  }

  /**
   * Disables inclusion of metadata in the print
   *
   * @see {@link https://loglayer.dev/logging-api/metadata.html#controlling-metadata-output | Controlling Metadata Output Docs}
   */
  muteMetadata() {
    this._config.muteMetadata = true;
    return this;
  }

  /**
   * Enables inclusion of metadata in the print
   *
   * @see {@link https://loglayer.dev/logging-api/metadata.html#controlling-metadata-output | Controlling Metadata Output Docs}
   */
  unMuteMetadata() {
    this._config.muteMetadata = false;
    return this;
  }

  /**
   * Enables a specific log level
   *
   * @see {@link https://loglayer.dev/logging-api/basic-logging.html#enabling-disabling-logging | Enabling/Disabling Logging Docs}
   */
  enableIndividualLevel(logLevel: LogLevelType) {
    this.logLevelManager.enableIndividualLevel(logLevel);
    return this;
  }

  /**
   * Disables a specific log level
   *
   * @see {@link https://loglayer.dev/logging-api/basic-logging.html#enabling-disabling-logging | Enabling/Disabling Logging Docs}
   */
  disableIndividualLevel(logLevel: LogLevelType) {
    this.logLevelManager.disableIndividualLevel(logLevel);
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
  setLevel(logLevel: LogLevelType) {
    this.logLevelManager.setLevel(logLevel);
    return this;
  }

  /**
   * Checks if a specific log level is enabled
   *
   * @see {@link https://loglayer.dev/logging-api/basic-logging.html#checking-if-a-log-level-is-enabled | Checking if a Log Level is Enabled Docs}
   */
  isLevelEnabled(logLevel: LogLevelType): boolean {
    return this.logLevelManager.isLevelEnabled(logLevel);
  }

  private formatContext(context: LogLayerContext | null) {
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

  private formatMetadata(data: LogLayerMetadata | null = null) {
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

  /**
   * Parses the LOGLAYER_GROUPS environment variable and overrides
   * _activeGroups and group levels accordingly.
   * Format: "name,name" or "name:level,name:level"
   */
  private _parseEnvGroups(): void {
    const envValue = typeof process !== "undefined" ? process.env?.LOGLAYER_GROUPS : undefined;

    if (!envValue) return;

    const entries = envValue
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const activeNames: string[] = [];

    for (const entry of entries) {
      const colonIdx = entry.indexOf(":");
      if (colonIdx > 0) {
        const name = entry.slice(0, colonIdx);
        const level = entry.slice(colonIdx + 1) as LogLevelType;
        activeNames.push(name);
        // Override group level if the group exists in config
        if (this._groupsConfig?.[name]) {
          this._groupsConfig[name] = { ...this._groupsConfig[name], level };
        }
      } else {
        activeNames.push(entry);
      }
    }

    this._activeGroups = new Set(activeNames);
  }

  /**
   * Merges per-log groups (from LogBuilder) with logger-level assigned groups.
   */
  private _mergeGroups(perLogGroups: string[] | null): string[] | null {
    if (this._assignedGroups && perLogGroups) {
      const combined = new Set([...this._assignedGroups, ...perLogGroups]);
      return Array.from(combined);
    }
    return perLogGroups || this._assignedGroups;
  }

  /**
   * Applies ungrouped routing rules for a transport.
   */
  private _applyUngroupedRules(transportId: string): boolean {
    if (this._ungroupedBehavior === "all") return true;
    if (this._ungroupedBehavior === "none") return false;
    return this._ungroupedBehavior.includes(transportId);
  }

  /**
   * Determines whether a transport should receive a log entry based on group routing rules.
   */
  private _shouldTransportReceiveLog(transportId: string, logLevel: LogLevelType, groups: string[] | null): boolean {
    // If no groups config at all, all transports get all logs (backward compat)
    if (!this._groupsConfig) {
      return true;
    }

    // Merge per-log groups with logger-level assigned groups
    const effectiveGroups = this._mergeGroups(groups);

    // If log has no groups, apply ungrouped rules
    if (!effectiveGroups || effectiveGroups.length === 0) {
      return this._applyUngroupedRules(transportId);
    }

    // Check if ANY of the log's groups allow this transport
    let hasAnyDefinedGroup = false;

    for (const groupName of effectiveGroups) {
      const groupConfig = this._groupsConfig[groupName];

      if (!groupConfig) {
        // Group not defined in config -- skip
        continue;
      }

      hasAnyDefinedGroup = true;

      // Check group.enabled (default true)
      if (groupConfig.enabled === false) {
        continue;
      }

      // Check activeGroups filter
      if (this._activeGroups && !this._activeGroups.has(groupName)) {
        continue;
      }

      // Check group level
      if (groupConfig.level) {
        const groupLevelPriority = LogLevelPriority[groupConfig.level as LogLevel];
        const logLevelPriority = LogLevelPriority[logLevel as LogLevel];
        if (logLevelPriority < groupLevelPriority) {
          continue;
        }
      }

      // Check if transport is in this group's transports list
      if (groupConfig.transports.includes(transportId)) {
        return true;
      }
    }

    // If log had groups but none were defined in config, treat as ungrouped
    if (!hasAnyDefinedGroup) {
      return this._applyUngroupedRules(transportId);
    }

    // Log had defined groups but none passed for this transport
    return false;
  }

  _formatMessage(messages: MessageDataType[] = []) {
    const { prefix } = this._config;

    if (prefix && typeof messages[0] === "string") {
      messages[0] = `${prefix} ${messages[0]}`;
    }
  }

  _formatLog({
    logLevel,
    params = [],
    metadata = null,
    err,
    context = null,
    groups = null,
  }: FormatLogParams): void | Promise<void> {
    // Use provided context or fall back to context manager
    const rawContext = context !== null ? context : this.contextManager.getContext();

    // Resolve lazy values in context only if we know lazy values exist
    // When context is provided directly (e.g. from raw()), always check since
    // _lazyContextCount only tracks the context manager's context
    let finalContextData: LogLayerContext;
    if (this._lazyContextCount > 0 || context !== null) {
      const contextResult = resolveLazyValues(rawContext);

      if (contextResult.errors) {
        this._logLazyEvalErrors(contextResult.errors, "context");
      }

      // Async lazy values are not supported in context — replace with error indicators
      const { resolved, asyncKeys } = replacePromiseValues(contextResult.resolved);
      if (asyncKeys) {
        this._logAsyncLazyContextErrors(asyncKeys);
      }

      finalContextData = resolved;
    } else {
      finalContextData = rawContext;
    }

    // Resolve any lazy values in metadata at the root level
    let metadataErrors: LazyEvalFailure[] | null = null;
    if (metadata) {
      const metadataResult = resolveLazyValues(metadata);
      metadata = metadataResult.resolved as LogLayerMetadata;
      metadataErrors = metadataResult.errors;
    }

    if (metadataErrors) {
      this._logLazyEvalErrors(metadataErrors, "metadata");
    }

    // Check if any metadata values are Promises (from async lazy callbacks)
    const metadataHasPromises = metadata ? hasPromiseValues(metadata) : false;

    if (metadataHasPromises) {
      return this._resolveAsyncAndProcess(logLevel, params, finalContextData, metadata, err, context, groups);
    }

    this._processLog(logLevel, params, finalContextData, metadata, err, context, groups);
  }

  /**
   * Resolves any Promise values in metadata (from async lazy callbacks)
   * and then processes the log entry. Context is already fully resolved.
   */
  private async _resolveAsyncAndProcess(
    logLevel: LogLevelType,
    params: any[],
    contextData: LogLayerContext,
    metadata: LogLayerMetadata | null,
    err: any,
    context: LogLayerContext | null,
    groups: string[] | null,
  ): Promise<void> {
    let resolvedMetadata: LogLayerMetadata | null = null;
    if (metadata) {
      const metadataResult = await resolvePromiseValues(metadata);
      resolvedMetadata = metadataResult.resolved as LogLayerMetadata;
      if (metadataResult.errors) {
        this._logLazyEvalErrors(metadataResult.errors, "metadata");
      }
    }

    this._processLog(logLevel, params, contextData, resolvedMetadata, err, context, groups);
  }

  /**
   * Logs error entries for lazy evaluation failures.
   * Calls _processLog directly to bypass lazy evaluation and prevent recursion.
   */
  private _logLazyEvalErrors(failures: LazyEvalFailure[], source: "context" | "metadata") {
    if (this._isLoggingLazyError) {
      for (const f of failures) {
        console.error(`[LogLayer] Lazy evaluation error in ${source} key "${f.key}":`, f.error);
      }
      return;
    }

    this._isLoggingLazyError = true;

    try {
      for (const failure of failures) {
        const errorMessage = failure.error instanceof Error ? failure.error.message : String(failure.error);

        this._processLog(
          LogLevel.error,
          [`[LogLayer] Lazy evaluation failed for ${source} key "${failure.key}": ${errorMessage}`],
          {},
          null,
          failure.error instanceof Error ? failure.error : undefined,
          {},
        );
      }
    } finally {
      this._isLoggingLazyError = false;
    }
  }

  /**
   * Logs error entries for async lazy values found in context.
   * Async lazy values are only supported in metadata, not context.
   */
  private _logAsyncLazyContextErrors(keys: string[]) {
    if (this._isLoggingLazyError) {
      for (const key of keys) {
        console.error(
          `[LogLayer] Async lazy values are not supported in context (key "${key}"). Use async lazy only in metadata.`,
        );
      }
      return;
    }

    this._isLoggingLazyError = true;

    try {
      for (const key of keys) {
        this._processLog(
          LogLevel.error,
          [
            `[LogLayer] Async lazy values are not supported in context (key "${key}"). Use async lazy only in metadata.`,
          ],
          {},
          null,
          undefined,
          {},
        );
      }
    } finally {
      this._isLoggingLazyError = false;
    }
  }

  /**
   * Processes a log entry after lazy values have been fully resolved.
   * Handles data assembly, plugins, and transport dispatch.
   */
  private _processLog(
    logLevel: LogLevelType,
    params: any[],
    contextData: LogLayerContext,
    metadata: LogLayerMetadata | null,
    err: any,
    context: LogLayerContext | null,
    groups: string[] | null = null,
  ) {
    const { errorSerializer, errorFieldInMetadata, muteContext, contextFieldName, metadataFieldName, errorFieldName } =
      this._config;

    let hasObjData =
      !!metadata ||
      (muteContext ? false : context !== null ? Object.keys(context).length > 0 : this.contextManager.hasContextData());

    let d: LogLayerData | undefined | null = {};

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

    // Transform log level if plugins are registered (after onBeforeDataOut and onBeforeMessageOut)
    if (this.pluginManager.hasPlugins(PluginCallbackType.transformLogLevel)) {
      logLevel = this.pluginManager.runTransformLogLevel(
        {
          data: hasObjData ? d : undefined,
          logLevel,
          messages: [...params],
          error: err,
          metadata,
          context: contextData,
        },
        this,
      );
    }

    const effectiveGroups = this._mergeGroups(groups) ?? undefined;

    if (this.hasMultipleTransports) {
      const transportPromises = (this._config.transport as LogLayerTransport[])
        .filter((transport) => {
          if (!transport.enabled) return false;
          // Group routing check
          if (!this._shouldTransportReceiveLog(transport.id!, logLevel, groups)) return false;
          return true;
        })
        .map(async (transport) => {
          // Capture the transformed logLevel in the closure
          const currentLogLevel = logLevel;

          if (this.pluginManager.hasPlugins(PluginCallbackType.shouldSendToLogger)) {
            const shouldSend = this.pluginManager.runShouldSendToLogger(
              {
                messages: [...params],
                data: hasObjData ? d : undefined,
                logLevel: currentLogLevel,
                transportId: transport.id,
                error: err,
                metadata,
                context: contextData,
                groups: effectiveGroups,
              },
              this,
            );

            if (!shouldSend) {
              return;
            }
          }

          return transport._sendToLogger({
            logLevel: currentLogLevel,
            messages: [...params],
            data: hasObjData ? d : undefined,
            hasData: hasObjData,
            error: err,
            metadata,
            context: contextData,
            groups: effectiveGroups,
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

      // Group routing check
      if (!this._shouldTransportReceiveLog(this.singleTransport.id!, logLevel, groups)) {
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
            groups: effectiveGroups,
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
        groups: effectiveGroups,
      });
    }
  }
}
