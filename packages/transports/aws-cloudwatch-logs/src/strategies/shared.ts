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
const groupLocks = new Map<string, Promise<void>>();
const streamLocks = new Map<string, Promise<void>>();

export async function ensureGroupExists(
  client: CloudWatchLogsClient,
  logGroupName: string,
  onError: ErrorCallback,
): Promise<void> {
  const lock = groupLocks.get(logGroupName);
  if (lock) {
    return lock;
  }

  let release: () => void;
  groupLocks.set(
    logGroupName,
    new Promise((resolve) => {
      release = resolve;
    }),
  );

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

  release();
}

export async function ensureStreamExists(
  client: CloudWatchLogsClient,
  logGroupName: string,
  logStreamName: string,
  onError: ErrorCallback,
): Promise<void> {
  const key = `lock:${logGroupName}-${logStreamName}`;
  const lock = streamLocks.get(key);
  if (lock) {
    return lock;
  }

  let release: () => void;
  streamLocks.set(
    key,
    new Promise((resolve) => {
      release = resolve;
    }),
  );

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

  release();
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
