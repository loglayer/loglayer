import { LoggerlessTransport, type LoggerlessTransportConfig, type LogLayerTransportParams } from "@loglayer/transport";
import {
  type CloudWatchLogsHandler,
  type CloudWatchLogsHandlerOptions,
  createDefaultHandler,
  type ICloudWatchLogsHandler,
} from "./handlers/index.js";

type MessageFn = (params: LogLayerTransportParams, timestamp: number) => string;
type NameSelectorCallback = (params: LogLayerTransportParams) => string | undefined;

export interface CloudWatchLogsTransportConfig extends CloudWatchLogsHandlerOptions, LoggerlessTransportConfig {
  /**
   * AWS CloudWatch Logs group name to send logs to.
   * Pass a callback to select the group name dynamically based on transport params
   */
  groupName?: string | undefined | NameSelectorCallback;

  /**
   * AWS CloudWatch Logs stream name to send logs to.
   * Pass a callback to select the stream name dynamically based on transport params
   */
  streamName?: string | undefined | NameSelectorCallback;

  /**
   * A custom handler for sending logs to CloudWatch Logs.
   */
  handler?: CloudWatchLogsHandler;

  /**
   * A custom function to generate the final message to be sent to CloudWatch Logs.
   * If not provided, all messages are joined into a single string.
   * @see https://docs.aws.amazon.com/AmazonCloudWatchLogs/latest/APIReference/API_PutLogEvents.html
   */
  messageFn?: MessageFn;
}

type SimplifiedConfig = Omit<
  CloudWatchLogsTransportConfig,
  keyof LoggerlessTransportConfig | keyof CloudWatchLogsHandlerOptions | "handler"
>;

/**
 * Allows sending logs to AWS CloudWatch Logs.
 */
export class CloudWatchLogsTransport extends LoggerlessTransport {
  readonly #config: SimplifiedConfig;
  #handler: ICloudWatchLogsHandler;

  constructor(config: CloudWatchLogsTransportConfig = {}) {
    const { id, enabled, consoleDebug, level, handler, batchSize, delay, createIfNotExists, clientConfig, ...rest } =
      config;
    super({ id, enabled, consoleDebug, level });

    this.#config = rest;

    const handlerConfig: CloudWatchLogsHandlerOptions = { batchSize, delay, createIfNotExists, clientConfig };
    this.#handler =
      typeof handler === "function" ? handler(handlerConfig) : (handler ?? createDefaultHandler(handlerConfig));
  }

  shipToLogger(params: LogLayerTransportParams): any[] {
    const groupName =
      typeof this.#config.groupName === "function" ? this.#config.groupName(params) : this.#config.groupName;
    const streamName =
      typeof this.#config.streamName === "function" ? this.#config.streamName(params) : this.#config.streamName;

    const timestamp = Date.now();
    const message = this.#config.messageFn?.(params, timestamp) ?? params.messages.map((msg) => String(msg)).join(" ");
    this.#handler.handleEvent({ timestamp, message }, groupName, streamName);
    return this.#config.messageFn ? [message] : params.messages;
  }
}
