import type { InputLogEvent } from "@aws-sdk/client-cloudwatch-logs";
import type { CloudWatchLogsStrategyOptions, ErrorHandler, ICloudWatchLogsStrategy } from "../common.types.js";

export abstract class BaseStrategy implements ICloudWatchLogsStrategy {
  protected onError?: ErrorHandler;

  /**
   * Configures the strategy. This method is called by the transport.
   */
  _configure(params: CloudWatchLogsStrategyOptions) {
    this.onError = params.onError;
  }

  abstract sendEvent({
    event,
    logGroupName,
    logStreamName,
  }: {
    event: InputLogEvent;
    logGroupName: string;
    logStreamName: string;
  }): Promise<void> | void;

  cleanup(): Promise<void> | void {}
}
