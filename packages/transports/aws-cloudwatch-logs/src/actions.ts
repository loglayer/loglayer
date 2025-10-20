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
import type { ErrorHandler } from "./strategies/common.js";

// Tracks the groups and streams that have been created
const groupLocks = new Map<string, Promise<void> | true>();
const streamLocks = new Map<string, Promise<void> | true>();

export async function ensureGroupExists(
  client: CloudWatchLogsClient,
  logGroupName: string,
  onError: ErrorHandler,
): Promise<void> {
  const lock = groupLocks.get(logGroupName);
  if (lock instanceof Promise) {
    return lock;
  }
  if (lock) {
    return;
  }

  let release: () => void;
  groupLocks.set(
    logGroupName,
    new Promise((resolve) => {
      release = resolve;
    }),
  );

  try {
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
  } catch (error) {
    onError?.(error);
  } finally {
    release();
    groupLocks.set(logGroupName, true);
  }
}

export async function ensureStreamExists(
  client: CloudWatchLogsClient,
  logGroupName: string,
  logStreamName: string,
  onError: ErrorHandler,
): Promise<void> {
  const key = `lock:${logGroupName}-${logStreamName}`;
  const lock = streamLocks.get(key);
  if (lock instanceof Promise) {
    return lock;
  }
  if (lock) {
    return;
  }

  let release: () => void;
  streamLocks.set(
    key,
    new Promise((resolve) => {
      release = resolve;
    }),
  );

  try {
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
  } catch (error) {
    onError?.(error);
  } finally {
    release();
    streamLocks.set(key, true);
  }
}

export async function sendEvents(
  client: CloudWatchLogsClient,
  logEvents: InputLogEvent[],
  logGroupName: string,
  logStreamName: string,
  onError: ErrorHandler,
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
