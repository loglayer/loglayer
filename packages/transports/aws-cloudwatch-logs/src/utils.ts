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
import type { ErrorHandler } from "./common.types.js";

// Tracks the groups and streams that have been created
const groupLocks = new Map<string, Promise<void> | true>();
const streamLocks = new Map<string, Promise<void> | true>();

/**
 * Parameters for ensuring a CloudWatch log group exists.
 */
export interface EnsureGroupExistsParams {
  /**
   * The AWS CloudWatch Logs client instance to use for operations.
   */
  client: CloudWatchLogsClient;
  /**
   * The name of the log group to ensure exists.
   */
  logGroupName: string;
  /**
   * Error handler callback to be called if an error occurs during operations.
   */
  onError: ErrorHandler;
}

export async function ensureGroupExists({ client, logGroupName, onError }: EnsureGroupExistsParams): Promise<void> {
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

/**
 * Parameters for ensuring a CloudWatch log stream exists.
 */
export interface EnsureStreamExistsParams {
  /**
   * The AWS CloudWatch Logs client instance to use for operations.
   */
  client: CloudWatchLogsClient;
  /**
   * The name of the log group that contains the stream.
   */
  logGroupName: string;
  /**
   * The name of the log stream to ensure exists.
   */
  logStreamName: string;
  /**
   * Error handler callback to be called if an error occurs during operations.
   */
  onError: ErrorHandler;
}

export async function ensureStreamExists({
  client,
  logGroupName,
  logStreamName,
  onError,
}: EnsureStreamExistsParams): Promise<void> {
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

/**
 * Parameters for sending log events to CloudWatch Logs.
 */
export interface SendEventsParams {
  /**
   * The AWS CloudWatch Logs client instance to use for sending events.
   */
  client: CloudWatchLogsClient;
  /**
   * Array of log events to send to CloudWatch Logs.
   */
  logEvents: InputLogEvent[];
  /**
   * The name of the log group to send events to.
   */
  logGroupName: string;
  /**
   * The name of the log stream to send events to.
   */
  logStreamName: string;
  /**
   * Error handler callback to be called if an error occurs while sending events.
   */
  onError: ErrorHandler;
}

export async function sendEvents({ client, logEvents, logGroupName, logStreamName, onError }: SendEventsParams) {
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
