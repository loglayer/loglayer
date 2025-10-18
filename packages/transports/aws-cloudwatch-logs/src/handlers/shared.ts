import {
  type CloudWatchLogsClient,
  CreateLogGroupCommand,
  CreateLogStreamCommand,
  DescribeLogGroupsCommand,
  type DescribeLogGroupsCommandOutput,
  DescribeLogStreamsCommand,
  type DescribeLogStreamsCommandOutput,
  type InputLogEvent,
  PutLogEventsCommand,
} from "@aws-sdk/client-cloudwatch-logs";
import type { ErrorCallback } from "./common.js";

// Tracks the groups and streams that have been created
const groups: string[] = [];
const streams: string[] = [];

// A lock to avoid trying to create the same group or stream twice while in parallel
let lockState = false;
async function lock(callback: () => Promise<void>) {
  while (lockState) {
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  lockState = true;
  return await callback().finally(() => {
    lockState = false;
  });
}

export function ensureGroupExists(client: CloudWatchLogsClient, logGroupName: string, onError: ErrorCallback) {
  if (groups.includes(logGroupName)) {
    return;
  }

  return lock(async () => {
    const result: DescribeLogGroupsCommandOutput | undefined = await client
      .send(new DescribeLogGroupsCommand({ logGroupIdentifiers: [logGroupName] }))
      .catch((error) => {
        onError?.(
          new Error(`An error occurred while getting the specified CloudWatch log group: '${logGroupName}'`, {
            cause: error,
          }),
        );
        return undefined;
      });
    if (result && !result.logGroups?.find((g) => g.logGroupName === logGroupName)) {
      await client.send(new CreateLogGroupCommand({ logGroupName })).catch((error) =>
        onError?.(
          new Error(`An error occurred while creating the specified CloudWatch log group: '${logGroupName}'`, {
            cause: error,
          }),
        ),
      );
    }
    groups.push(logGroupName);
  });
}

export function ensureStreamExists(
  client: CloudWatchLogsClient,
  logGroupName: string,
  logStreamName: string,
  onError: ErrorCallback,
) {
  if (streams.includes(logStreamName)) {
    return;
  }

  return lock(async () => {
    const result: DescribeLogStreamsCommandOutput | undefined = await client
      .send(new DescribeLogStreamsCommand({ logGroupName, logStreamNamePrefix: logStreamName }))
      .catch((error) => {
        onError?.(
          new Error(`An error occurred while getting the specified CloudWatch log stream: '${logStreamName}'`, {
            cause: error,
          }),
        );
        return undefined;
      });
    if (result && !result.logStreams?.find((s) => s.logStreamName === logStreamName)) {
      await client.send(new CreateLogStreamCommand({ logGroupName, logStreamName })).catch((error) =>
        onError?.(
          new Error(`An error occurred while creating the specified CloudWatch log stream: '${logStreamName}'`, {
            cause: error,
          }),
        ),
      );
    }
  });
}

export async function sendEvents(
  client: CloudWatchLogsClient,
  logEvents: InputLogEvent[],
  logGroupName: string,
  logStreamName: string,
  onError: ErrorCallback,
) {
  const command = new PutLogEventsCommand({
    logEvents,
    logGroupName,
    logStreamName,
  });
  try {
    await client.send(command);
  } catch (error) {
    onError?.(
      new Error(
        `An error occurred while sending log events to the CloudWatch service. LogGroupName: ${logGroupName}, LogStreamName: ${logStreamName}`,
        { cause: error },
      ),
    );
  }
}
