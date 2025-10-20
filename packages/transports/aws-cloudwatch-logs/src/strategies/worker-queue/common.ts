import type { InputLogEvent } from "@aws-sdk/client-cloudwatch-logs";
import type { CloudWatchLogsStrategyOptions } from "../common.js";

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
}

export interface WorkerDataOptions
  extends Omit<CloudWatchLogsStrategyOptions, "onError">,
    CloudWatchLogsWorkerQueueOptions {
  hasErrorHandler: boolean;
}

export interface WorkerEventMessage {
  event: InputLogEvent;
  logGroupName: string;
  logStreamName: string;
}

export interface WorkerError {
  error: any;
}
