import { LoggerlessTransport, type LoggerlessTransportConfig, type LogLayerTransportParams } from "@loglayer/transport";
import {
  CloudWatchLogsDefaultStrategy,
  type CloudWatchLogsStrategy,
  type CloudWatchLogsStrategyOptions,
  type ICloudWatchLogsStrategy,
} from "./strategies/index.js";

type MessageFn = (params: LogLayerTransportParams, timestamp: number) => string;
type NameSelectorCallback = (params: LogLayerTransportParams) => string;

export interface CloudWatchLogsTransportConfig extends CloudWatchLogsStrategyOptions, LoggerlessTransportConfig {
  /**
   * AWS CloudWatch Logs group name to send logs to.
   * Pass a callback to select the group name dynamically based on transport params
   */
  groupName: string | NameSelectorCallback;

  /**
   * AWS CloudWatch Logs stream name to send logs to.
   * Pass a callback to select the stream name dynamically based on transport params
   */
  streamName: string | NameSelectorCallback;

  /**
   * A custom strategy for sending logs to CloudWatch Logs.
   */
  strategy?: CloudWatchLogsStrategy;

  /**
   * A custom function to generate the final message to be sent to CloudWatch Logs.
   * The default template is `[level] message`.
   * @see https://docs.aws.amazon.com/AmazonCloudWatchLogs/latest/APIReference/API_PutLogEvents.html
   */
  messageFn?: MessageFn;
}

type SimplifiedConfig = Omit<
  CloudWatchLogsTransportConfig,
  keyof LoggerlessTransportConfig | keyof CloudWatchLogsStrategyOptions | "strategy" | "onError"
>;

/**
 * Allows sending logs to AWS CloudWatch Logs.
 */
export class CloudWatchLogsTransport extends LoggerlessTransport {
  readonly #config: SimplifiedConfig;
  #strategy: ICloudWatchLogsStrategy;

  constructor(config: CloudWatchLogsTransportConfig) {
    const { id, enabled, consoleDebug, level, strategy, createIfNotExists, clientConfig, onError, ...rest } = config;
    super({ id, enabled, consoleDebug, level });

    this.#config = rest;

    const strategyConfig: CloudWatchLogsStrategyOptions = { createIfNotExists, clientConfig, onError };
    this.#strategy = strategy?.(strategyConfig) ?? CloudWatchLogsDefaultStrategy(strategyConfig);
  }

  shipToLogger(params: LogLayerTransportParams): any[] {
    const groupName =
      typeof this.#config.groupName === "function" ? this.#config.groupName(params) : this.#config.groupName;
    const streamName =
      typeof this.#config.streamName === "function" ? this.#config.streamName(params) : this.#config.streamName;

    const timestamp = Date.now();
    const message =
      this.#config.messageFn?.(params, timestamp) ??
      `[${params.logLevel}] ${params.messages.map((msg) => String(msg)).join(" ")}`;
    this.#strategy.sendEvent({ timestamp, message }, groupName, streamName);
    return [message];
  }
}
