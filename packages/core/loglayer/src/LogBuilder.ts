import { PluginCallbackType } from "@loglayer/plugin";
import type { ILogBuilder, LogLayerMetadata, MessageDataType } from "@loglayer/shared";
import { LogLevel, type LogLevelType } from "@loglayer/shared";
import type { LogLayer } from "./LogLayer.js";
import type { PluginManager } from "./PluginManager.js";

/**
 * A class that contains methods to specify log metadata and an error and assembles
 * it to form a data object that can be passed into the transport.
 */
export class LogBuilder implements ILogBuilder {
  private err: any;
  private metadata: LogLayerMetadata;
  private structuredLogger: LogLayer;
  private hasMetadata: boolean;
  private pluginManager: PluginManager;

  constructor(structuredLogger: LogLayer) {
    this.err = null;
    this.metadata = {};
    this.structuredLogger = structuredLogger;
    this.hasMetadata = false;
    this.pluginManager = structuredLogger["pluginManager"];
  }

  /**
   * Specifies metadata to include with the log message
   *
   * @see {@link https://loglayer.dev/logging-api/metadata.html | Metadata Docs}
   */
  withMetadata(metadata?: LogLayerMetadata) {
    const {
      pluginManager,
      structuredLogger: {
        _config: { consoleDebug },
      },
    } = this;

    if (!metadata) {
      if (consoleDebug) {
        console.debug("[LogLayer] withMetadata was called with no metadata; dropping.");
      }

      return this;
    }

    let data: LogLayerMetadata | null = metadata;

    if (pluginManager.hasPlugins(PluginCallbackType.onMetadataCalled)) {
      data = pluginManager.runOnMetadataCalled(metadata, this.structuredLogger);

      if (!data) {
        if (consoleDebug) {
          console.debug("[LogLayer] Metadata was dropped due to plugin returning falsy value.");
        }

        return this;
      }
    }

    this.metadata = {
      ...this.metadata,
      ...data,
    };

    this.hasMetadata = true;

    return this;
  }

  /**
   * Specifies an Error to include with the log message
   *
   * @see {@link https://loglayer.dev/logging-api/error-handling.html | Error Handling Docs}
   */
  withError(error: any) {
    this.err = error;
    return this;
  }

  /**
   * Sends a log message to the logging library under an info log level.
   */
  info(...messages: MessageDataType[]) {
    if (!this.structuredLogger.isLevelEnabled(LogLevel.info)) return;
    this.structuredLogger._formatMessage(messages);
    this.formatLog(LogLevel.info, messages);
  }

  /**
   * Sends a log message to the logging library under the warn log level
   */
  warn(...messages: MessageDataType[]) {
    if (!this.structuredLogger.isLevelEnabled(LogLevel.warn)) return;
    this.structuredLogger._formatMessage(messages);
    this.formatLog(LogLevel.warn, messages);
  }

  /**
   * Sends a log message to the logging library under the error log level
   */
  error(...messages: MessageDataType[]) {
    if (!this.structuredLogger.isLevelEnabled(LogLevel.error)) return;
    this.structuredLogger._formatMessage(messages);
    this.formatLog(LogLevel.error, messages);
  }

  /**
   * Sends a log message to the logging library under the debug log level
   *
   * The logging library may or may not support multiple message parameters and only
   * the first parameter would be used.
   */
  debug(...messages: MessageDataType[]) {
    if (!this.structuredLogger.isLevelEnabled(LogLevel.debug)) return;
    this.structuredLogger._formatMessage(messages);
    this.formatLog(LogLevel.debug, messages);
  }

  /**
   * Sends a log message to the logging library under the trace log level
   *
   * The logging library may or may not support multiple message parameters and only
   * the first parameter would be used.
   */
  trace(...messages: MessageDataType[]) {
    if (!this.structuredLogger.isLevelEnabled(LogLevel.trace)) return;
    this.structuredLogger._formatMessage(messages);
    this.formatLog(LogLevel.trace, messages);
  }

  /**
   * Sends a log message to the logging library under the fatal log level
   *
   * The logging library may or may not support multiple message parameters and only
   * the first parameter would be used.
   */
  fatal(...messages: MessageDataType[]) {
    if (!this.structuredLogger.isLevelEnabled(LogLevel.fatal)) return;
    this.structuredLogger._formatMessage(messages);
    this.formatLog(LogLevel.fatal, messages);
  }

  /**
   * All logging inputs are dropped and stops sending logs to the logging library.
   */
  disableLogging() {
    this.structuredLogger.disableLogging();
    return this;
  }

  /**
   * Enable sending logs to the logging library.
   */
  enableLogging() {
    this.structuredLogger.enableLogging();
    return this;
  }

  private formatLog(logLevel: LogLevelType, params: any[]) {
    const { muteMetadata } = this.structuredLogger._config;

    const hasData = muteMetadata ? false : this.hasMetadata;

    this.structuredLogger._formatLog({ logLevel, params, metadata: hasData ? this.metadata : null, err: this.err });
  }
}
