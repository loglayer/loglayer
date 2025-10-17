import type { CloudWatchLogsClientConfig, InputLogEvent } from "@aws-sdk/client-cloudwatch-logs";

export interface CloudWatchLogsHandlerOptions {
  /**
   * AWS CloudWatch Logs client configuration to use when creating a new client.
   */
  clientConfig?: CloudWatchLogsClientConfig;

  /**
   * Try to create the log group and log stream if they don't exist yet when sending logs.
   * @defaultValue false
   */
  createIfNotExists?: boolean;

  /**
   * The amount of time in milliseconds to wait before sending logs to CloudWatch Logs.
   * If not specified, all logs will be sent to CloudWatch Logs immediately.
   * @defaultValue 0
   */
  delay?: number;

  /**
   * The maximum number of logs to send to CloudWatch Logs at once. The default and maximum is 10000.
   * @see https://docs.aws.amazon.com/AmazonCloudWatchLogs/latest/APIReference/API_PutLogEvents.html#API_PutLogEvents_RequestParameters
   * @defaultValue 10000
   */
  batchSize?: number;

  /**
   * Callback to be called if an error occurs while sending logs to CloudWatch Logs.
   * @param error - The error that occurred
   * @returns
   */
  onError?: (error: any) => void;
}

/**
 * Handles log events and sends them to CloudWatch Logs.
 */
export interface ICloudWatchLogsHandler {
  /**
   * Handles the given log event.
   * @param event - The log event to be sent
   * @param logGroupName - Group name
   * @param logStreamName - Stream name
   */
  handleEvent(event: InputLogEvent, logGroupName?: string, logStreamName?: string): Promise<void> | void;
}

export type CloudWatchLogsHandler =
  | ICloudWatchLogsHandler
  | ((options: CloudWatchLogsHandlerOptions) => ICloudWatchLogsHandler);
