import type { InputLogEvent } from "@aws-sdk/client-cloudwatch-logs";

export interface WorkerEventMessage {
  event: InputLogEvent;
  logGroupName?: string;
  logStreamName?: string;
}
