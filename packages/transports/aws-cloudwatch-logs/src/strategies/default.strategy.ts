import { CloudWatchLogsClient, type InputLogEvent } from "@aws-sdk/client-cloudwatch-logs";
import { ensureGroupExists, ensureStreamExists, sendEvents } from "../actions.js";
import type { CloudWatchLogsStrategy, CloudWatchLogsStrategyOptions, ICloudWatchLogsStrategy } from "./common.js";

// The default strategy is responsible for handling log events and sending them to CloudWatch Logs.
class DefaultStrategy implements ICloudWatchLogsStrategy {
  #clientInstance?: CloudWatchLogsClient;

  constructor(protected readonly options: CloudWatchLogsStrategyOptions) {}

  get client() {
    this.#clientInstance ??= new CloudWatchLogsClient(this.options.clientConfig);
    return this.#clientInstance;
  }

  public async sendEvent(event: InputLogEvent, logGroupName: string, logStreamName: string): Promise<void> {
    if (this.options.createIfNotExists) {
      await ensureGroupExists(this.client, logGroupName, this.options.onError);
      await ensureStreamExists(this.client, logGroupName, logStreamName, this.options.onError);
    }

    await sendEvents(this.client, [event], logGroupName, logStreamName, this.options.onError);
  }
}

/**
 * Default strategy for sending log events to CloudWatch Logs.
 * @param options - Strategy options
 * @returns
 */
export const CloudWatchLogsDefaultStrategy: CloudWatchLogsStrategy = (options = {}) => new DefaultStrategy(options);
