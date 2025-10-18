import { CloudWatchLogsClient, type InputLogEvent } from "@aws-sdk/client-cloudwatch-logs";
import type { CloudWatchLogsHandler, CloudWatchLogsHandlerOptions, ICloudWatchLogsHandler } from "./common.js";
import { ensureGroupExists, ensureStreamExists, sendEvents } from "./shared.js";

// The default handler is responsible for handling log events and sending them to CloudWatch Logs.
class DefaultHandler implements ICloudWatchLogsHandler {
  #clientInstance?: CloudWatchLogsClient;

  constructor(protected readonly options: CloudWatchLogsHandlerOptions) {}

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
 * Default handler for sending log events to CloudWatch Logs.
 * @param options - Handler options
 * @returns
 */
export const CloudWatchLogsDefaultHandler: CloudWatchLogsHandler = (options = {}) => new DefaultHandler(options);
