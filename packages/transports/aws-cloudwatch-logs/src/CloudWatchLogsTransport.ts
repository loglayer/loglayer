import { LoggerlessTransport, type LoggerlessTransportConfig, type LogLayerTransportParams } from "@loglayer/transport";
import type { ErrorHandler } from "./common.types.js";
import type { BaseStrategy } from "./strategies/base.strategy.js";
import { DefaultCloudWatchStrategy } from "./strategies/default.strategy.js";
import type { CloudWatchLogsStrategyOptions } from "./strategies/index.js";

type PayloadTemplateFn = (params: LogLayerTransportParams, timestamp: number) => string;
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
   * A strategy for sending logs to CloudWatch Logs.
   * If not provided, the DefaultCloudWatchStrategy will be used.
   */
  strategy?: BaseStrategy;

  /**
   * A custom function to generate the message to be sent to CloudWatch Logs.
   * The default template is `[level] message`.
   * @see https://docs.aws.amazon.com/AmazonCloudWatchLogs/latest/APIReference/API_PutLogEvents.html
   */
  payloadTemplate?: PayloadTemplateFn;
}

type SimplifiedConfig = Omit<
  CloudWatchLogsTransportConfig,
  keyof LoggerlessTransportConfig | keyof CloudWatchLogsStrategyOptions | "strategy" | "onError"
>;

/**
 * Allows sending logs to AWS CloudWatch Logs.
 */
export class CloudWatchLogsTransport extends LoggerlessTransport implements Disposable {
  readonly #config: SimplifiedConfig;
  #strategy: BaseStrategy;
  #onError: ErrorHandler | undefined;

  constructor(config: CloudWatchLogsTransportConfig) {
    const { id, enabled, consoleDebug, level, strategy, onError, ...rest } = config;
    super({ id, enabled, consoleDebug, level });

    this.#config = rest;
    this.#onError = onError;

    // Use DefaultCloudWatchStrategy if no strategy is provided
    this.#strategy = strategy ?? new DefaultCloudWatchStrategy();
    this.#strategy._configure({ onError });
  }

  shipToLogger(params: LogLayerTransportParams): any[] {
    const groupName =
      typeof this.#config.groupName === "function" ? this.#config.groupName(params) : this.#config.groupName;
    const streamName =
      typeof this.#config.streamName === "function" ? this.#config.streamName(params) : this.#config.streamName;

    const timestamp = Date.now();

    const message =
      this.#config.payloadTemplate?.(params, timestamp) ??
      `[${params.logLevel}] ${params.messages.map((msg) => String(msg)).join(" ")}`;

    const action = this.#strategy.sendEvent({
      event: { timestamp, message },
      logGroupName: groupName,
      logStreamName: streamName,
    });

    if (action instanceof Promise && this.#onError) {
      action.catch((error) => this.#onError?.(error));
    }

    return [message];
  }

  [Symbol.dispose](): void {
    this.#strategy.cleanup();
  }
}
