import {
  CloudWatchLogsClient,
  CreateLogGroupCommand,
  CreateLogStreamCommand,
  DescribeLogGroupsCommand,
  type DescribeLogGroupsCommandOutput,
  DescribeLogStreamsCommand,
  type DescribeLogStreamsCommandOutput,
  type InputLogEvent,
  PutLogEventsCommand,
} from "@aws-sdk/client-cloudwatch-logs";
import type { CloudWatchLogsHandler, CloudWatchLogsHandlerOptions, ICloudWatchLogsHandler } from "./common.js";

interface EventChannel {
  groupId?: number;
  streamId?: number;
  events: InputLogEvent[];
}

// The default handler is responsible for handling log events and sending them to CloudWatch Logs.
class DefaultHandler implements ICloudWatchLogsHandler {
  private readonly groups: string[] = [];
  private readonly streams: string[] = [];
  private readonly channels: EventChannel[] = [];
  private intervalId?: NodeJS.Timeout;
  private clientInstance?: CloudWatchLogsClient;

  constructor(private readonly options: CloudWatchLogsHandlerOptions) {}

  private get client() {
    this.clientInstance ??= new CloudWatchLogsClient(this.options.clientConfig);
    return this.clientInstance;
  }

  public async handleEvent(event: InputLogEvent, logGroupName?: string, logStreamName?: string) {
    let groupId = logGroupName ? this.groups.indexOf(logGroupName) : undefined;
    if (groupId === -1) {
      groupId = this.groups.length;
      this.groups.push(logGroupName);

      if (this.options.createIfNotExists) {
        const result: DescribeLogGroupsCommandOutput | undefined = await this.client
          .send(new DescribeLogGroupsCommand({ logGroupIdentifiers: [logGroupName] }))
          .catch((error) => {
            this.options.onError?.(
              new Error(`An error occurred while getting the specified CloudWatch log group: '${logGroupName}'`, {
                cause: error,
              }),
            );
            return undefined;
          });
        if (result && !result.logGroups?.find((g) => g.logGroupName === logGroupName)) {
          await this.client.send(new CreateLogGroupCommand({ logGroupName })).catch((error) =>
            this.options.onError?.(
              new Error(`An error occurred while creating the specified CloudWatch log group: '${logGroupName}'`, {
                cause: error,
              }),
            ),
          );
        }
      }
    }

    let streamId = logStreamName ? this.streams.indexOf(logStreamName) : undefined;
    if (streamId === -1) {
      streamId = this.streams.length;
      this.streams.push(logStreamName);

      if (this.options.createIfNotExists) {
        const result: DescribeLogStreamsCommandOutput | undefined = await this.client
          .send(new DescribeLogStreamsCommand({ logGroupName, logStreamNamePrefix: logStreamName }))
          .catch((error) => {
            this.options.onError?.(
              new Error(`An error occurred while getting the specified CloudWatch log stream: '${logStreamName}'`, {
                cause: error,
              }),
            );
            return undefined;
          });
        if (result && !result.logStreams?.find((s) => s.logStreamName === logStreamName)) {
          await this.client.send(new CreateLogStreamCommand({ logGroupName, logStreamName })).catch((error) =>
            this.options.onError?.(
              new Error(`An error occurred while creating the specified CloudWatch log stream: '${logStreamName}'`, {
                cause: error,
              }),
            ),
          );
        }
      }
    }

    if (!this.options.delay || this.options.delay <= 0) {
      await this.sendEvents([event], logGroupName, logStreamName);
    } else {
      this.intervalId ??= setInterval(async () => {
        for (const channel of this.channels) {
          const events = channel.events.splice(0, this.options.batchSize ?? 10000);
          await this.sendEvents(events, this.groups[channel.groupId], this.streams[channel.streamId]);
        }
      }, this.options.delay);

      let channel = this.channels.find((c) => c.groupId === groupId && c.streamId === streamId);
      if (!channel) {
        channel = { groupId, streamId, events: [] };
        this.channels.push(channel);
      }

      channel.events.push(event);
    }
  }

  private async sendEvents(logEvents: InputLogEvent[], logGroupName?: string, logStreamName?: string) {
    const command = new PutLogEventsCommand({
      logEvents,
      logGroupName,
      logStreamName,
    });
    try {
      await this.client.send(command);
    } catch (error) {
      this.options.onError?.(
        new Error(
          `An error occurred while sending log events to the CloudWatch service. LogGroupName: ${logGroupName}, LogStreamName: ${logStreamName}`,
          { cause: error },
        ),
      );
    }
  }
}

/**
 * Creates a default handler instance.
 * @param options - Handler options
 * @returns
 */
export function createDefaultHandler(options: CloudWatchLogsHandlerOptions = {}): ICloudWatchLogsHandler {
  return new DefaultHandler(options);
}

/**
 * Default handler for sending log events to CloudWatch Logs.
 * @param options - Handler options
 * @returns
 */
export const CloudWatchLogsDefaultHandler: CloudWatchLogsHandler = (options = {}) => createDefaultHandler(options);
