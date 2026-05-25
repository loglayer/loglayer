import { PluginCallbackType } from "@loglayer/plugin";
import type { ILogBuilder, LogLayerMetadata, MessageDataType } from "@loglayer/shared";
import { LogLevel, type LogLevelType } from "@loglayer/shared";
import type { LogLayer } from "./LogLayer.js";
import { mixinRegistry } from "./mixins.js";
import type { PluginManager } from "./PluginManager.js";

/**
 * Checks if the arguments are from a tagged template literal call.
 * Tagged templates pass a TemplateStringsArray (which has a `raw` property)
 * as the first argument.
 */
function isTaggedTemplate(args: any[]): args is [TemplateStringsArray, ...any[]] {
  const first = args[0];
  return Array.isArray(first) && typeof (first as any).raw !== "undefined";
}

/**
 * Converts a tagged template call back into a string.
 * Uses String() for all interpolated values to handle objects, null, undefined, etc.
 */
function taggedTemplateToString(strings: TemplateStringsArray, values: any[]): string {
  let result = "";
  for (let i = 0; i < strings.length; i++) {
    result += strings[i];
    if (i < values.length) {
      result += String(values[i]);
    }
  }
  return result;
}

/**
 * A class that contains methods to specify log metadata and an error and assembles
 * it to form a data object that can be passed into the transport.
 */
export class LogBuilder implements ILogBuilder<LogBuilder, boolean> {
  private err: any;
  private metadata: LogLayerMetadata;
  private structuredLogger: LogLayer;
  private hasMetadata: boolean;
  private pluginManager: PluginManager;
  private _groups: string[] | null = null;

  constructor(structuredLogger: LogLayer) {
    this.err = null;
    this.metadata = {};
    this.structuredLogger = structuredLogger;
    this.hasMetadata = false;
    this.pluginManager = structuredLogger["pluginManager"];

    if (mixinRegistry.logBuilderHandlers.length > 0) {
      mixinRegistry.logBuilderHandlers.forEach((mixin) => {
        if (mixin.onConstruct) {
          mixin.onConstruct(this, structuredLogger);
        }
      });
    }
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

    return this as any;
  }

  /**
   * Specifies an Error to include with the log message
   *
   * @see {@link https://loglayer.dev/logging-api/error-handling.html | Error Handling Docs}
   */
  withError(error: any) {
    this.err = error;
    return this as any;
  }

  /**
   * Tags this log entry with one or more groups for routing.
   *
   * @see {@link https://loglayer.dev/logging-api/groups.html | Groups Docs}
   */
  withGroup(group: string | string[]) {
    const newGroups = Array.isArray(group) ? group : [group];

    if (this._groups) {
      const combined = new Set([...this._groups, ...newGroups]);
      this._groups = Array.from(combined);
    } else {
      this._groups = [...newGroups];
    }

    return this as any;
  }

  /**
   * Sends a log message to the logging library under an info log level.
   *
   * Supports tagged template syntax:
   * ```typescript
   * log.withMetadata({ userId }).info`User ${userId} logged in`;
   * ```
   */
  info(...args: [TemplateStringsArray, ...any[]] | MessageDataType[]): void | Promise<void> {
    if (!this.structuredLogger.isLevelEnabled(LogLevel.info)) return;
    let messages: MessageDataType[];
    if (isTaggedTemplate(args)) {
      messages = [taggedTemplateToString(args[0], args.slice(1))];
    } else {
      messages = args as MessageDataType[];
    }
    this.structuredLogger._formatMessage(messages);
    return this.formatLog(LogLevel.info, messages);
  }

  /**
   * Sends a log message to the logging library under the warn log level
   *
   * Supports tagged template syntax:
   * ```typescript
   * log.withMetadata({ requestId }).warn`Request ${requestId} timed out`;
   * ```
   */
  warn(...args: [TemplateStringsArray, ...any[]] | MessageDataType[]): void | Promise<void> {
    if (!this.structuredLogger.isLevelEnabled(LogLevel.warn)) return;
    let messages: MessageDataType[];
    if (isTaggedTemplate(args)) {
      messages = [taggedTemplateToString(args[0], args.slice(1))];
    } else {
      messages = args as MessageDataType[];
    }
    this.structuredLogger._formatMessage(messages);
    return this.formatLog(LogLevel.warn, messages);
  }

  /**
   * Sends a log message to the logging library under the error log level
   *
   * Supports tagged template syntax:
   * ```typescript
   * log.withError(err).error`Failed to process ${taskId}`;
   * ```
   */
  error(...args: [TemplateStringsArray, ...any[]] | MessageDataType[]): void | Promise<void> {
    if (!this.structuredLogger.isLevelEnabled(LogLevel.error)) return;
    let messages: MessageDataType[];
    if (isTaggedTemplate(args)) {
      messages = [taggedTemplateToString(args[0], args.slice(1))];
    } else {
      messages = args as MessageDataType[];
    }
    this.structuredLogger._formatMessage(messages);
    return this.formatLog(LogLevel.error, messages);
  }

  /**
   * Sends a log message to the logging library under the debug log level
   *
   * The logging library may or may not support multiple message parameters and only
   * the first parameter would be used.
   *
   * Supports tagged template syntax:
   * ```typescript
   * log.withMetadata({ cacheKey }).debug`Cache hit for ${cacheKey}`;
   * ```
   */
  debug(...args: [TemplateStringsArray, ...any[]] | MessageDataType[]): void | Promise<void> {
    if (!this.structuredLogger.isLevelEnabled(LogLevel.debug)) return;
    let messages: MessageDataType[];
    if (isTaggedTemplate(args)) {
      messages = [taggedTemplateToString(args[0], args.slice(1))];
    } else {
      messages = args as MessageDataType[];
    }
    this.structuredLogger._formatMessage(messages);
    return this.formatLog(LogLevel.debug, messages);
  }

  /**
   * Sends a log message to the logging library under the trace log level
   *
   * The logging library may or may not support multiple message parameters and only
   * the first parameter would be used.
   *
   * Supports tagged template syntax:
   * ```typescript
   * log.withMetadata({ functionName }).trace`Entering ${functionName}`;
   * ```
   */
  trace(...args: [TemplateStringsArray, ...any[]] | MessageDataType[]): void | Promise<void> {
    if (!this.structuredLogger.isLevelEnabled(LogLevel.trace)) return;
    let messages: MessageDataType[];
    if (isTaggedTemplate(args)) {
      messages = [taggedTemplateToString(args[0], args.slice(1))];
    } else {
      messages = args as MessageDataType[];
    }
    this.structuredLogger._formatMessage(messages);
    return this.formatLog(LogLevel.trace, messages);
  }

  /**
   * Sends a log message to the logging library under the fatal log level
   *
   * The logging library may or may not support multiple message parameters and only
   * the first parameter would be used.
   *
   * Supports tagged template syntax:
   * ```typescript
   * log.withError(err).fatal`System crash: ${reason}`;
   * ```
   */
  fatal(...args: [TemplateStringsArray, ...any[]] | MessageDataType[]): void | Promise<void> {
    if (!this.structuredLogger.isLevelEnabled(LogLevel.fatal)) return;
    let messages: MessageDataType[];
    if (isTaggedTemplate(args)) {
      messages = [taggedTemplateToString(args[0], args.slice(1))];
    } else {
      messages = args as MessageDataType[];
    }
    this.structuredLogger._formatMessage(messages);
    return this.formatLog(LogLevel.fatal, messages);
  }

  /**
   * All logging inputs are dropped and stops sending logs to the logging library.
   */
  disableLogging() {
    this.structuredLogger.disableLogging();
    return this as any;
  }

  /**
   * Enable sending logs to the logging library.
   */
  enableLogging() {
    this.structuredLogger.enableLogging();
    return this as any;
  }

  private formatLog(logLevel: LogLevelType, params: any[]): void | Promise<void> {
    const { muteMetadata } = this.structuredLogger._config;

    const hasData = muteMetadata ? false : this.hasMetadata;

    return this.structuredLogger._formatLog({
      logLevel,
      params,
      metadata: hasData ? this.metadata : null,
      err: this.err,
      groups: this._groups,
    });
  }
}
