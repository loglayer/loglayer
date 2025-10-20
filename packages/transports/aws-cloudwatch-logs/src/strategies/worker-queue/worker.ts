import { parentPort, workerData } from "node:worker_threads";
import { CloudWatchLogsClient, type InputLogEvent } from "@aws-sdk/client-cloudwatch-logs";
import { ensureGroupExists, ensureStreamExists, sendEvents } from "../../actions.js";
import type { ErrorHandler } from "../common.js";
import type { WorkerDataOptions, WorkerError, WorkerEventMessage } from "./common.js";

interface EventChannel {
  logGroupName: string;
  logStreamName: string;
  events: InputLogEvent[];
}

// TSX can't handle this worker without a default export
export default null;

const options: WorkerDataOptions = workerData ?? {};
options.delay ??= 6000;
options.batchSize ??= 10000;

const errorHandler: ErrorHandler = options.hasErrorHandler
  ? (error) => parentPort?.postMessage({ error } as WorkerError)
  : console.error;

const client = new CloudWatchLogsClient(options.clientConfig);
const channels: EventChannel[] = [];

parentPort?.on("message", async ({ event, logGroupName, logStreamName }: WorkerEventMessage) => {
  if (options.createIfNotExists) {
    await ensureGroupExists(client, logGroupName, errorHandler);
    await ensureStreamExists(client, logGroupName, logStreamName, errorHandler);
  }

  let channel = channels.find((c) => c.logGroupName === logGroupName && c.logStreamName === logStreamName);
  if (!channel) {
    channel = { logGroupName, logStreamName, events: [] };
    channels.push(channel);
  }

  channel.events.push(event);
});

// This validation is required because TSX cannot handle this file properly when running the livetest, resulting in a null parentPort
if (parentPort) {
  // Every 6 seconds (configurable), send a batch of log events to cloudwatch logs.
  setInterval(async () => {
    for (const channel of channels) {
      if (channel.events.length > 0) {
        const events = channel.events.splice(0, Math.min(channel.events.length, options.batchSize));
        await sendEvents(client, events, channel.logGroupName, channel.logStreamName, errorHandler);
      }
    }
  }, options.delay);
}
