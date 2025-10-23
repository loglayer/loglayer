import type { CloudWatchLogsClientConfig, InputLogEvent } from "@aws-sdk/client-cloudwatch-logs";

export interface CloudWatchLogsWorkerQueueOptions {
  /**
   * The amount of time in milliseconds to wait before sending logs to CloudWatch Logs.
   * If not specified, all logs will be sent to CloudWatch Logs every 6 seconds.
   * @defaultValue 6000
   */
  delay?: number;

  /**
   * The maximum number of logs to send to CloudWatch Logs at once. The default and maximum is 10000.
   * @see https://docs.aws.amazon.com/AmazonCloudWatchLogs/latest/APIReference/API_PutLogEvents.html#API_PutLogEvents_RequestParameters
   * @defaultValue 10000
   */
  batchSize?: number;

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

export interface WorkerDataOptions extends CloudWatchLogsWorkerQueueOptions {
  hasErrorHandler: boolean;
}

export interface WorkerEventMessage {
  type: "event";
  event: InputLogEvent;
  logGroupName: string;
  logStreamName: string;
}

export interface WorkerStopMessage {
  type: "stop";
}

export type WorkerMessage = WorkerEventMessage | WorkerStopMessage;

export interface WorkerError {
  type: "error";
  error: any;
}

export type WorkerResponse = WorkerError | WorkerStopMessage;
