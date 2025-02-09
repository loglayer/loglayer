import type { LogLayerPlugin } from "@loglayer/plugin";
import type { LogLayerTransport } from "@loglayer/transport";

export { LogLevel, type ErrorOnlyOpts, type ILogLayer, type ILogBuilder } from "@loglayer/shared";

export type ErrorSerializerType = (err: any) => Record<string, any> | string;

export interface LogLayerConfig {
  /**
   * The prefix to prepend to all log messages
   */
  prefix?: string;
  /**
   * Set to false to drop all log input and stop sending to the logging
   * library.
   *
   * Can be re-enabled with `enableLogging()`.
   *
   * Default is `true`.
   */
  enabled?: boolean;
  /**
   * If set to true, will also output messages via console logging before
   * sending to the logging library.
   *
   * Useful for troubleshooting a logging library / transports
   * to ensure logs are still being created when the underlying
   * does not print anything.
   */
  consoleDebug?: boolean;
  /**
   * The transport(s) that implements a logging library to send logs to.
   * Can be a single transport or an array of transports.
   */
  transport: LogLayerTransport | Array<LogLayerTransport>;
  /**
   * Plugins to use.
   */
  plugins?: Array<LogLayerPlugin>;

  /**
   * A function that takes in an incoming Error type and transforms it into an object.
   * Used in the event that the logging library does not natively support serialization of errors.
   */
  errorSerializer?: ErrorSerializerType;
  /**
   * Logging libraries may require a specific field name for errors so it knows
   * how to parse them.
   *
   * Default is 'err'.
   */
  errorFieldName?: string;
  /**
   * If true, always copy error.message if available as a log message along
   * with providing the error data to the logging library.
   *
   * Can be overridden individually by setting `copyMsg: false` in the `onlyError()`
   * call.
   *
   * Default is false.
   */
  copyMsgOnOnlyError?: boolean;
  /**
   * If set to true, the error will be included as part of metadata instead of
   * of the root of the log data.
   *
   * metadataFieldName must be set to true for this to work.
   *
   * Default is false.
   */
  errorFieldInMetadata?: boolean;
  /**
   * If specified, will set the context object to a specific field
   * instead of flattening the data alongside the error and message.
   *
   * Default is context data will be flattened.
   */
  contextFieldName?: string;
  /**
   * If specified, will set the metadata data to a specific field
   * instead of flattening the data alongside the error and message.
   *
   * Default is metadata will be flattened.
   */
  metadataFieldName?: string;
  /**
   * If set to true, will not include context data in the log message.
   */
  muteContext?: boolean;
  /**
   * If set to true, will not include metadata data in the log message.
   */
  muteMetadata?: boolean;
  /**
   * If set to true, child loggers will link to their parent's context instead of
   * creating a shallow copy. This means changes to the context in child loggers
   * will affect the parent logger's context and vice versa.
   *
   * Default is false.
   */
  linkParentContext?: boolean;
}
