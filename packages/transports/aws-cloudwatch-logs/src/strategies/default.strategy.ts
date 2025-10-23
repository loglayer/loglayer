import { CloudWatchLogsClient, type CloudWatchLogsClientConfig } from "@aws-sdk/client-cloudwatch-logs";
import type { SendEventParams } from "../common.types.js";
import { ensureGroupExists, ensureStreamExists, sendEvents } from "../utils.js";
import { BaseStrategy } from "./base.strategy.js";

export interface DefaultCloudWatchStrategyStrategyOptions {
  /**
   * AWS CloudWatch Logs client configuration to use when creating a new client.
   */
  clientConfig?: CloudWatchLogsClientConfig;

  /**
   * Try to create the log group and log stream if they don't exist yet when sending logs.
   * @defaultValue false
   */
  createIfNotExists?: boolean;
}

// The default strategy is responsible for handling log events and sending them to CloudWatch Logs.
export class DefaultCloudWatchStrategy extends BaseStrategy {
  #client: CloudWatchLogsClient;
  #createIfNotExists: boolean;

  constructor(config?: DefaultCloudWatchStrategyStrategyOptions) {
    super();
    this.#client = new CloudWatchLogsClient(config?.clientConfig);
    this.#createIfNotExists = config?.createIfNotExists ?? false;
  }

  public async sendEvent({ event, logGroupName, logStreamName }: SendEventParams): Promise<void> {
    if (this.#createIfNotExists) {
      await ensureGroupExists({
        client: this.#client,
        logGroupName,
        onError: this.onError,
      });
      await ensureStreamExists({
        client: this.#client,
        logGroupName,
        logStreamName,
        onError: this.onError,
      });
    }

    await sendEvents({
      client: this.#client,
      logEvents: [event],
      logGroupName,
      logStreamName,
      onError: this.onError,
    });
  }
}
