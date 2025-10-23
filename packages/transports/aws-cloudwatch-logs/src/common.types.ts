import type { InputLogEvent } from "@aws-sdk/client-cloudwatch-logs";

export interface CloudWatchLogsStrategyOptions {
  /**
   * Callback to be called if an error occurs while sending logs to CloudWatch Logs.
   * @param error - The error that occurred
   * @returns
   */
  onError?: ErrorHandler;
}

export interface SendEventParams {
  /**
   * The log event to send.
   */
  event: InputLogEvent;

  /**
   * The group name to send the log event to.
   */
  logGroupName: string;

  /**
   * The stream name to send the log event to.
   */
  logStreamName: string;
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
  sendEvent({ event, logGroupName, logStreamName }: SendEventParams): Promise<void> | void;

  /**
   * Cleans up any resources used by the strategy.
   */
  cleanup: () => Promise<void> | void;
}
export type ErrorHandler = (error: any) => Promise<void> | void;
