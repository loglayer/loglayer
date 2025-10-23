import type { CloudWatchLogsClientConfig, InputLogEvent } from "@aws-sdk/client-cloudwatch-logs";

export type ErrorHandler = (error: any) => Promise<void> | void;

export interface CloudWatchLogsStrategyOptions {
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
   * Callback to be called if an error occurs while sending logs to CloudWatch Logs.
   * @param error - The error that occurred
   * @returns
   */
  onError?: ErrorHandler;
}

/**
 * Handles log events and sends them to CloudWatch Logs.
 */
export interface ICloudWatchLogsStrategy {
  /**
   * Sends the given log event to CloudWatch Logs.
   * @param event - The log event
   * @param logGroupName - Group name
   * @param logStreamName - Stream name
   */
  sendEvent(event: InputLogEvent, logGroupName: string, logStreamName: string): Promise<void> | void;

  /**
   * Cleans up any resources used by the strategy.
   */
  cleanup?: () => Promise<void> | void;
}

/**
 * Represents a builder function that creates a new strategy to send the log events to CloudWatch Logs.
 */
export type CloudWatchLogsStrategy = (options: CloudWatchLogsStrategyOptions) => ICloudWatchLogsStrategy;
